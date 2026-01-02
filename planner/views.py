from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import DailyPlan, ShoppingList, ShoppingListItem
from .serializers import DailyPlanSerializer, ShoppingListSerializer # <--- Asegúrate de tener este serializer (lo creamos ahora)


class DailyPlanViewSet(viewsets.ModelViewSet):
    queryset = DailyPlan.objects.all()
    serializer_class = DailyPlanSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filtro de seguridad: Solo mis grupos
        queryset = queryset.filter(group__members=self.request.user)

        # Filtro específico si el frontend manda ?group=5
        group_id = self.request.query_params.get('group')
        if group_id:
            queryset = queryset.filter(group_id=group_id)

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        return queryset

class ShoppingListViewSet(viewsets.ModelViewSet):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer

    @action(detail=False, methods=['post'])
    def generate(self, request):
        # 1. Pasamos los datos al serializer (incluyendo el group_id)
        # Nota: Asumimos group=1 si no viene, para facilitar pruebas
        data = request.data.copy()
        if 'group' not in data:
            data['group'] = 2

        serializer = self.get_serializer(data=data)
        
        # 2. Validamos (DRF comprueba fechas correctas, tipos, etc.)
        if serializer.is_valid():
            # 3. Guardamos (Esto dispara el método .create() del serializer con la lógica)
            shopping_list = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)