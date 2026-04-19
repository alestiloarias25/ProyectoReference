# Create your models here.
from django.db import models
from django.contrib.auth.models import User
import uuid


class UserProfile(models.Model):
    ROLE_ADMINISTRADOR = "ADMINISTRADOR"
    ROLE_ARRENDADOR = "ARRENDADOR"
    ROLE_ARRENDATARIO = "ARRENDATARIO"

    ROLE_CHOICES = [
        (ROLE_ADMINISTRADOR, "Usuario Administrador"),
        (ROLE_ARRENDADOR, "Usuario Arrendador"),
        (ROLE_ARRENDATARIO, "Usuario Arrendatario"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_ARRENDADOR)
    celular = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Token for {self.user.username}"
