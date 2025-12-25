from rest_framework import serializers
from .models import Meal, Ingredient, RecipeIngredient

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name']

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    
    # Hacemos que el ID del ingrediente sea obligatorio al escribir
    ingredient_id = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(), source='ingredient', write_only=True
    )

    class Meta:
        model = RecipeIngredient
        # 'ingredient' es para lectura (objeto anidado si quisieras), 
        # 'ingredient_id' es para escritura (el número ID)
        fields = ['id', 'ingredient_id', 'ingredient_name', 'quantity', 'unit']

class MealSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(many=True)

    class Meta:
        model = Meal
        fields = ['id', 'name', 'meal_type', 'base_servings', 'ingredients', 'group']

    def create(self, validated_data):
        # 1. Sacamos los ingredientes del paquete de datos
        ingredients_data = validated_data.pop('ingredients')
        
        # 2. Creamos la Receta (Meal) sola
        meal = Meal.objects.create(**validated_data)
        
        # 3. Creamos cada ingrediente vinculado a esa receta
        for ingredient_item in ingredients_data:
            RecipeIngredient.objects.create(meal=meal, **ingredient_item)
            
        return meal