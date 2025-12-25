from django.db import models
from users.models import PlanningGroup
from recipes.models import Meal

class DailyPlan(models.Model):
    """
    Asigna una comida a una fecha específica para un grupo.
    """
    SLOT_CHOICES = [
        ('BREAKFAST', 'Desayuno'),
        ('LUNCH', 'Comida'),
        ('DINNER', 'Cena'),
        ('SNACK', 'Otros'),
    ]
    group = models.ForeignKey(PlanningGroup, on_delete=models.CASCADE, related_name='plans')
    date = models.DateField(verbose_name="Fecha de consumo")
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE)

    meal_slot = models.CharField(
        max_length=20, 
        choices=SLOT_CHOICES, 
        default='LUNCH', # Por defecto que sea comida
        verbose_name="Franja horaria"
    )
    
    # CLAVE DEL PROYECTO:
    # Aquí definimos para cuántas personas es la comida ESTE día.
    # Esto permite recalcular ingredientes sin tocar la receta original.
    target_servings = models.PositiveIntegerField(default=4, verbose_name="Raciones para este día")

    class Meta:
        ordering = ['date', 'meal_slot'] # Ordenamos por fecha y luego por franja

    def __str__(self):
        return f"{self.date} ({self.get_meal_slot_display()}) - {self.meal.name}"

class ShoppingList(models.Model):
    """
    Cabecera de la lista de la compra generada para un rango de fechas.
    """
    group = models.ForeignKey(PlanningGroup, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lista del {self.start_date} al {self.end_date}"

class ShoppingListItem(models.Model):
    """
    Cada ítem de la lista.
    Guardamos el nombre como texto (no ForeignKey) para permitir que el usuario
    edite la lista libremente (ej: añadir 'Papel higiénico' que no es una receta).
    """
    shopping_list = models.ForeignKey(ShoppingList, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    quantity = models.FloatField(default=0)
    unit = models.CharField(max_length=20)
    is_purchased = models.BooleanField(default=False)

    def __str__(self):
        status = "[X]" if self.is_purchased else "[ ]"
        return f"{status} {self.name} ({self.quantity} {self.unit})"