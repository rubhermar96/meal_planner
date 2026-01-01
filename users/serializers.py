from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import PlanningGroup

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('username',)

class PlanningGroupSerializer(serializers.ModelSerializer):
    # Mostramos los nombres de los miembros para que sea legible en el JSON
    members_names = serializers.StringRelatedField(many=True, source='members', read_only=True)
    
    class Meta:
        model = PlanningGroup
        fields = ['id', 'name', 'members', 'members_names', 'planning_config', 'created_at']
        read_only_fields = ['members', 'created_at']