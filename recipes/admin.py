# recipes/admin.py
from django.contrib import admin
from .models import Ingredient, Meal, RecipeIngredient

class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1 # Cuántas filas vacías mostrar por defecto

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = ('name', 'meal_type', 'base_servings', 'group')
    list_filter = ('meal_type', 'group')
    search_fields = ('name',)
    inlines = [RecipeIngredientInline] # <--- Esto activa la magia