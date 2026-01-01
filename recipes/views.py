from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.db import transaction
from .models import Meal, Ingredient, RecipeIngredient
from .serializers import MealSerializer, IngredientSerializer

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Ingredient.objects.filter(user__isnull=True)
        # Globales (user=None) O Míos (user=yo)
        return Ingredient.objects.filter(Q(user__isnull=True) | Q(user=user)).distinct()

    def perform_create(self, serializer):
        # Al crear, asignamos al usuario actual
        serializer.save(user=self.request.user)


class MealViewSet(viewsets.ModelViewSet):
    queryset = Meal.objects.all()
    serializer_class = MealSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Meal.objects.none()
        # Solo mis recetas
        return Meal.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # --- LA MAGIA: IMPORTAR RECETA ---
    @action(detail=True, methods=['post'])
    def import_recipe(self, request, pk=None):
        """
        Copia una receta (ID=pk) a la biblioteca del usuario actual.
        """
        try:
            # 1. Obtenemos la receta original (aunque no sea mía, si tengo el ID puedo clonarla)
            # Nota: Podrías añadir seguridad extra para comprobar si pertenece a un grupo compartido
            original_meal = Meal.objects.get(pk=pk)
            
            existing_copy = Meal.objects.filter(user=request.user, source_meal=original_meal).exists()
            if existing_copy:
                 return Response({"message": "Ya tienes una copia de esta receta"}, status=200)

            if original_meal.user == request.user:
                return Response({"message": "Esta receta ya es tuya"}, status=200)

            with transaction.atomic():
                # 2. Clonamos la receta (Objeto Meal)
                new_meal = Meal.objects.create(
                    name=f"{original_meal.name}",
                    meal_type=original_meal.meal_type,
                    base_servings=original_meal.base_servings,
                    user=request.user, # ¡Ahora es mía!
                    source_meal=original_meal
                )

                # 3. Clonamos los ingredientes
                for recipe_ing in original_meal.ingredients.all():
                    original_ingredient = recipe_ing.ingredient
                    
                    # LOGICA INTELIGENTE DE INGREDIENTES:
                    # Si el ingrediente es global, lo reutilizamos.
                    # Si es privado de otro usuario, buscamos si YO ya tengo uno con el mismo nombre.
                    # Si no tengo uno igual, creo una copia privada para mí.
                    
                    target_ingredient = None
                    
                    if original_ingredient.user is None:
                        # Es global, lo usamos directo
                        target_ingredient = original_ingredient
                    else:
                        # Es privado. ¿Tengo yo uno igual?
                        my_existing = Ingredient.objects.filter(
                            user=request.user, 
                            name__iexact=original_ingredient.name
                        ).first()
                        
                        if my_existing:
                            target_ingredient = my_existing
                        else:
                            # No lo tengo, creo una copia para mí
                            target_ingredient = Ingredient.objects.create(
                                name=original_ingredient.name,
                                user=request.user
                            )

                    # Creamos la relación en la tabla intermedia
                    RecipeIngredient.objects.create(
                        meal=new_meal,
                        ingredient=target_ingredient,
                        quantity=recipe_ing.quantity,
                        unit=recipe_ing.unit
                    )

            return Response({"status": "Receta importada correctamente", "new_id": new_meal.id})

        except Meal.DoesNotExist:
            return Response({"error": "Receta no encontrada"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)