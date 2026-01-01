from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField

class Ingredient(models.Model):
    name = models.CharField(max_length=100)
    # user=Null -> Ingrediente Global (Agua, Sal)
    # user=User -> Ingrediente Privado
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='ingredients')

    def __str__(self):
        return self.name

class Meal(models.Model):
    MEAL_TYPES = [
        ('HOME', 'Hecho en casa'),
        ('OUT', 'Comida fuera'),
    ]
    name = models.CharField(max_length=200)
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPES, default='HOME')
    base_servings = models.PositiveIntegerField(default=2)

    # upload_to='meals/' crea una carpeta 'meals' en tu Cloudinary
    image = models.ImageField(upload_to='meals/', blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)
    
    # La receta pertenece al USUARIO, no al grupo
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meals')
    source_meal = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='copies')
    
    # Nota: Quitamos el campo 'group' de aquí
    
    def __str__(self):
        return self.name

class RecipeIngredient(models.Model):
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='ingredients')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField()
    unit = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.quantity} {self.unit} of {self.ingredient.name}"