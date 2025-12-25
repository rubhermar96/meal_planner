# planner/admin.py
from django.contrib import admin
from .models import DailyPlan, ShoppingList, ShoppingListItem

@admin.register(DailyPlan)
class DailyPlanAdmin(admin.ModelAdmin):
    list_display = ('date', 'meal', 'group', 'target_servings')
    list_filter = ('date', 'group')
    date_hierarchy = 'date' # Añade navegación por fechas arriba

class ShoppingListItemInline(admin.TabularInline):
    model = ShoppingListItem
    extra = 0

@admin.register(ShoppingList)
class ShoppingListAdmin(admin.ModelAdmin):
    list_display = ('start_date', 'end_date', 'group')
    inlines = [ShoppingListItemInline]