from rest_framework.permissions import BasePermission
from .models import UserProfile


ROLE_ADMINISTRADOR = UserProfile.ROLE_ADMINISTRADOR
ROLE_ARRENDADOR = UserProfile.ROLE_ARRENDADOR
ROLE_ARRENDATARIO = UserProfile.ROLE_ARRENDATARIO


def get_user_profile(user):
    if not getattr(user, "is_authenticated", False):
        return None

    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={"role": ROLE_ADMINISTRADOR},
    )
    return profile


def get_user_role(user):
    profile = get_user_profile(user)
    return profile.role if profile else None


class RolePermission(BasePermission):
    allowed_roles = tuple()

    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return bool(role and role in self.allowed_roles)


class IsAdministrador(RolePermission):
    allowed_roles = (ROLE_ADMINISTRADOR,)


class IsAdministradorOrArrendador(RolePermission):
    allowed_roles = (ROLE_ADMINISTRADOR, ROLE_ARRENDADOR)


class IsAdministradorOrArrendadorReadOnly(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        if not role:
            return False

        if role == ROLE_ADMINISTRADOR:
            return True

        return role == ROLE_ARRENDADOR and request.method in ("GET", "HEAD", "OPTIONS")


class CanEvaluateArrendatario(RolePermission):
    allowed_roles = (
        ROLE_ADMINISTRADOR,
        ROLE_ARRENDADOR,
        ROLE_ARRENDATARIO,
    )
