from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile
from .permissions import get_user_profile


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, write_only=True)
    role_value = serializers.CharField(source="profile.role", read_only=True)
    role_label = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "role",
            "role_value",
            "role_label",
        )

    def get_role_label(self, obj):
        profile = get_user_profile(obj)
        return profile.get_role_display() if profile else ""

    def validate_username(self, value):
        queryset = User.objects.filter(username=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Ese nombre de usuario ya existe.")
        return value

    def validate_email(self, value):
        queryset = User.objects.filter(email=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if value and queryset.exists():
            raise serializers.ValidationError("Ese correo ya esta registrado.")
        return value

    def create(self, validated_data):
        role = validated_data.pop("role")
        password = validated_data.pop("password", "").strip()

        if not password:
            raise serializers.ValidationError({"password": "La contrasena es obligatoria."})

        user = User.objects.create_user(password=password, **validated_data)
        UserProfile.objects.update_or_create(user=user, defaults={"role": role})
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop("role", None)
        password = validated_data.pop("password", "").strip()

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if password:
            instance.set_password(password)

        instance.save()

        if role:
            UserProfile.objects.update_or_create(user=instance, defaults={"role": role})

        return instance
