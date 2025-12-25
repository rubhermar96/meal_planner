from django.db import models
from users.models import PlanningGroup

class Ingredient(models.Model):
    """
    Catálogo único de ingredientes (ej: Arroz, Pollo, Sal).
    Evitamos duplicados con unique=True.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre")

    def __str__(self):
        return self.name

class Meal(models.Model):
    """
    La definición del plato.
    """
    TYPE_CHOICES = [
        ('HOME', 'En Casa'),
        ('OUT', 'Fuera de Casa'),
    ]

    name = models.CharField(max_length=200, verbose_name="Nombre del plato")
    meal_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='HOME')
    
    # Raciones base para las que se creó la receta (ej: receta para 4 personas)
    base_servings = models.PositiveIntegerField(default=4, verbose_name="Raciones Base")
    
    # Si group es null, la receta es "pública" o plantilla base.
    # Si tiene grupo, pertenece solo a ese grupo.
    group = models.ForeignKey(PlanningGroup, on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class RecipeIngredient(models.Model):
    """
    Tabla intermedia que vincula una Comida con un Ingrediente
    especificando la cantidad y unidad.
    """
    UNIT_CHOICES = [
        ('g', 'Gramos'),
        ('kg', 'Kilogramos'),
        ('ml', 'Mililitros'),
        ('l', 'Litros'),
        ('u', 'Unidades'),
        ('tbsp', 'Cucharada'),
        ('tsp', 'Cucharadita'),
    ]

    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='ingredients')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    
    quantity = models.FloatField(verbose_name="Cantidad")
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)

    def __str__(self):
        return f"{self.quantity} {self.unit} de {self.ingredient.name}"