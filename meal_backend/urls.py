from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from recipes.views import MealViewSet, IngredientViewSet, MediaProxyView
from planner.views import DailyPlanViewSet, ShoppingListViewSet
from users.views import RegisterView, UserViewSet, PlanningGroupViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# El router crea automáticamente rutas como /meals/, /meals/5/, etc.
router = DefaultRouter()
router.register(r'meals', MealViewSet)
router.register(r'ingredients', IngredientViewSet)
router.register(r'plans', DailyPlanViewSet)
router.register(r'shopping-lists', ShoppingListViewSet)
router.register(r'users', UserViewSet)
router.register(r'groups', PlanningGroupViewSet, basename='planninggroup')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # Todas nuestras rutas empezarán por /api/
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/media-proxy/<path:filepath>', MediaProxyView.as_view(), name='media_proxy'),
]