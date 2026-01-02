from rest_framework import serializers
from .models import DailyPlan, ShoppingList, ShoppingListItem, Meal
from recipes.serializers import MealSerializer
from django.db import transaction

class DailyPlanSerializer(serializers.ModelSerializer):
    # Al leer, queremos ver todos los datos de la comida (nombre, foto, etc), no solo el ID
    meal_details = MealSerializer(source='meal', read_only=True)

    class Meta:
        model = DailyPlan
        fields = ['id', 'date', 'group', 'meal', 'meal_details', 'target_servings', 'meal_slot', 'is_eating_out', 'custom_name']
        extra_kwargs = {
            'meal': {'required': False, 'allow_null': True}
        }

    def validate(self, data):
        # Si estamos editando (PATCH/PUT), usamos valores de la instancia si no vienen en data
        if self.instance:
            meal = data.get('meal', self.instance.meal)
            is_eating_out = data.get('is_eating_out', self.instance.is_eating_out)
            custom_name = data.get('custom_name', self.instance.custom_name)
        else:
            meal = data.get('meal')
            is_eating_out = data.get('is_eating_out')
            custom_name = data.get('custom_name')

        # Lógica de validación: O hay receta, O es comer fuera
        if not meal and not is_eating_out:
            raise serializers.ValidationError("Debes seleccionar una receta o indicar que comes fuera.")
        
        # Si es comer fuera, el nombre es obligatorio
        if is_eating_out and not custom_name:
            raise serializers.ValidationError("Si comes fuera, debes indicar el nombre del sitio.")

        return data

class ShoppingListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingListItem
        fields = ['id', 'name', 'quantity', 'unit', 'is_purchased']

class ShoppingListSerializer(serializers.ModelSerializer):
    items = ShoppingListItemSerializer(many=True, read_only=True)
    
    # Estos campos ya existen en el modelo, así que DRF los usará para validar
    # que vengan en el JSON (start_date, end_date, group).

    class Meta:
        model = ShoppingList
        fields = ['id', 'start_date', 'end_date', 'group', 'items', 'created_at']
        read_only_fields = ['items', 'created_at'] # Items se generan solos

    def create(self, validated_data):
        """
        Aquí está la MAGIA. Sobrescribimos la creación estándar.
        En lugar de solo guardar fechas, calculamos los ingredientes.
        """
        start_date = validated_data['start_date']
        end_date = validated_data['end_date']
        group = validated_data['group']

        # 1. Lógica de Negocio: Buscar planes y calcular ingredientes
        plans = DailyPlan.objects.filter(
            group=group,
            date__range=[start_date, end_date],
            is_eating_out=False
        ).select_related('meal')

        # Si no hay planes, podríamos lanzar error, o crear lista vacía.
        # Aquí creamos lista vacía para no romper el flujo.
        
        ingredients_totals = {}

        for plan in plans:
            # Cálculo de ratio (Raciones deseadas / Raciones base)
            # Evitamos división por cero si la receta estuviera mal
            base = plan.meal.base_servings if plan.meal.base_servings > 0 else 1
            ratio = plan.target_servings / base
            
            for recipe_ing in plan.meal.ingredients.all():
                needed_qty = recipe_ing.quantity * ratio
                key = (recipe_ing.ingredient.name, recipe_ing.unit)
                
                if key in ingredients_totals:
                    ingredients_totals[key] += needed_qty
                else:
                    ingredients_totals[key] = needed_qty

        # 2. Guardado Atómico (Todo o nada)
        with transaction.atomic():
            # A. Creamos la cabecera de la lista (usando los datos validados)
            shopping_list = ShoppingList.objects.create(**validated_data)

            # B. Creamos los items calculados
            items_to_create = []
            for (name, unit), qty in ingredients_totals.items():
                items_to_create.append(ShoppingListItem(
                    shopping_list=shopping_list,
                    name=name,
                    quantity=round(qty, 2),
                    unit=unit
                ))
            
            # Bulk create es más eficiente que hacer un create por cada ingrediente
            ShoppingListItem.objects.bulk_create(items_to_create)

        return shopping_list