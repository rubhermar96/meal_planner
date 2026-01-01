from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer, UserSerializer, PlanningGroupSerializer
from django.shortcuts import get_object_or_404
from .models import PlanningGroup

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # Permitir que cualquiera se registre sin estar logueado
    serializer_class = RegisterSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Esta función permite acceder a /api/users/me/
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = self.get_serializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

class PlanningGroupViewSet(viewsets.ModelViewSet):
    serializer_class = PlanningGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Solo mostrar los grupos a los que pertenece el usuario
        return self.request.user.planning_groups.all()

    def perform_create(self, serializer):
        # Al crear un grupo, el creador se añade automáticamente
        group = serializer.save()
        group.members.add(self.request.user)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """
        Añadir un usuario al grupo mediante su username o email.
        """
        group = self.get_object()
        username_or_email = request.data.get('username')

        if not username_or_email:
            return Response({"error": "Debes indicar un usuario"}, status=400)

        # Buscamos por username O email
        try:
            user_to_add = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            try:
                user_to_add = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                return Response({"error": "Usuario no encontrado"}, status=404)

        group.members.add(user_to_add)
        return Response({"status": f"{user_to_add.username} añadido al grupo"})