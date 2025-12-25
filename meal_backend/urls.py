from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from recipes.views import MealViewSet, IngredientViewSet
from planner.views import DailyPlanViewSet, ShoppingListViewSet

# El router crea automáticamente rutas como /meals/, /meals/5/, etc.
router = DefaultRouter()
router.register(r'meals', MealViewSet)
router.register(r'ingredients', IngredientViewSet)
router.register(r'plans', DailyPlanViewSet)
router.register(r'shopping-lists', ShoppingListViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # Todas nuestras rutas empezarán por /api/
]