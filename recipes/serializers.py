import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from .models import Meal, Ingredient, RecipeIngredient

# --- CLASE PERSONALIZADA PARA IMÁGENES BASE64 ---
# Esto reemplaza a la librería drf-extra-fields que da error en Python 3.13+
class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        # Si recibimos una cadena (base64), la convertimos a archivo
        if isinstance(data, str) and data.startswith('data:image'):
            # formato esperado: "data:image/png;base64,iVBORw0KGgo..."
            try:
                format, imgstr = data.split(';base64,')
                ext = format.split('/')[-1] # ej: png, jpg
                file_name = f"{uuid.uuid4()}.{ext}"
                data = ContentFile(base64.b64decode(imgstr), name=file_name)
            except Exception as e:
                raise serializers.ValidationError("Formato de imagen base64 inválido")
        
        return super().to_internal_value(data)
# ------------------------------------------------

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'user']
        read_only_fields = ['user']

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    unit = serializers.CharField() 
    
    class Meta:
        model = RecipeIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'quantity', 'unit']

class MealSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(many=True)
    owner_name = serializers.ReadOnlyField(source='user.username')
    is_saved_by_user = serializers.SerializerMethodField()
    
    # Usamos nuestra clase personalizada
    image = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = Meal
        fields = ['id', 'name', 'meal_type', 'base_servings', 'ingredients', 'owner_name', 'is_saved_by_user', 'instructions', 'image']
    
    def get_is_saved_by_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
            
        if obj.user == request.user:
            return True
            
        return Meal.objects.filter(user=request.user, source_meal=obj).exists()

    def create(self, validated_data):
        # 1. Sacamos los datos anidados y la imagen
        ingredients_data = validated_data.pop('ingredients')
        image = validated_data.pop('image', None) # <--- IMPORTANTE: Sacarla aquí

        # 2. Creamos la receta SIN la imagen primero (para evitar el error de DB)
        meal = Meal.objects.create(**validated_data)
        
        # 3. Si hay imagen, la asignamos ahora. 
        # Al ser un ImageField estándar, Django gestionará la conversión a URL al guardar.
        if image:
            meal.image = image
            meal.save()

        # 4. Creamos ingredientes
        for ingredient_data in ingredients_data:
            RecipeIngredient.objects.create(meal=meal, **ingredient_data)
            
        return meal

    def update(self, instance, validated_data):
        # 1. Sacamos los datos especiales
        ingredients_data = validated_data.pop('ingredients', None)
        image = validated_data.pop('image', None) # Sacamos la imagen por si viene nueva

        # 2. Actualizamos los campos normales (nombre, raciones, instrucciones...)
        instance = super().update(instance, validated_data)

        # 3. Lógica de la Imagen
        # Si el usuario subió una nueva, actualizamos. Si no, dejamos la que estaba.
        if image:
            instance.image = image
            instance.save()

        # 4. Lógica de Ingredientes (Reemplazo completo)
        if ingredients_data is not None:
            # a) Borramos los ingredientes viejos vinculados a esta comida
            RecipeIngredient.objects.filter(meal=instance).delete()
            
            # b) Creamos los nuevos con los datos que vienen del formulario
            for ing_data in ingredients_data:
                RecipeIngredient.objects.create(meal=instance, **ing_data)

        return instance