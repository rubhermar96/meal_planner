# users/admin.py
from django.contrib import admin
from .models import PlanningGroup

@admin.register(PlanningGroup)
class PlanningGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    filter_horizontal = ('members',) # Para añadir usuarios fácilmente