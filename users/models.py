from django.db import models
from django.contrib.auth.models import User

class PlanningGroup(models.Model):
    """
    Representa un grupo de personas (familia, compañeros) que comparten
    un plan de comidas.
    """
    name = models.CharField(max_length=100, verbose_name="Nombre del Grupo")
    
    # Relación: Un grupo tiene varios usuarios, y un usuario puede estar en varios grupos.
    members = models.ManyToManyField(User, related_name='planning_groups')
    
    # Configuración de días: Guardaremos un JSON simple.
    # Ejemplo: {"mon": true, "tue": true, "wed": false, ...}
    planning_config = models.JSONField(default=dict, verbose_name="Días de planificación")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name