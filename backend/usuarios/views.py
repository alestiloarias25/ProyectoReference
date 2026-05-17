from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
import random

from .models import UserProfile
from .permissions import get_user_profile, IsAdministrador
from .serializers import AdminUserSerializer
from personas.models import Persona


# ======================================
# LOGIN
# ======================================

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    no_documento = request.data.get("no_documento")
    password = request.data.get("password")

    user = authenticate(username=no_documento, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=400)

    token, created = Token.objects.get_or_create(user=user)

    profile = get_user_profile(user)

    # Si no existe profile, asignar administrador por defecto
    role = profile.role if profile else "ADMIN"
    role_label = profile.get_role_display() if profile else "Administrador"

    persona_exists = False
    try:
        persona = Persona.objects.get(TPNoDocumento=user.username)
        full_name = f"{persona.TPNombres} {persona.TPApellidos}".strip()
        persona_exists = True
    except Persona.DoesNotExist:
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username

    return Response({
        "token": token.key,
        "user": user.username,
        "name": full_name,
        "role": role,
        "role_label": role_label,
        "persona_exists": persona_exists,
    })


# ======================================
# REGISTER
# ======================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    tipo_documento = request.data.get("tipo_documento")
    no_documento = request.data.get("no_documento")
    first_name = request.data.get("first_name", "")
    last_name = request.data.get("last_name", "")
    celular = request.data.get("celular", "")
    email = request.data.get("email")
    password = request.data.get("password")
    role = request.data.get("role")

    if not no_documento or not tipo_documento or not email or not password or not role:
        return Response({"error": "All fields are required"}, status=400)

    valid_roles = {choice[0] for choice in UserProfile.ROLE_CHOICES}

    if role not in valid_roles:
        return Response({"error": "Invalid role"}, status=400)

    if User.objects.filter(username=no_documento).exists():
        return Response({"error": "Document number already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=400)

    user = User.objects.create_user(
        username=no_documento,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    UserProfile.objects.create(
        user=user,
        role=role,
        celular=celular
    )


    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "message": "User created successfully",
        "user": user.username,
        "token": token.key,
        "role": role,
    })


# ======================================
# CHECK DOCUMENT
# ======================================

@api_view(['GET'])
@permission_classes([AllowAny])
def check_document(request):
    no_documento = request.query_params.get("no_documento")
    if not no_documento:
        return Response({"error": "no_documento is required"}, status=400)
    
    exists = User.objects.filter(username=no_documento).exists()
    return Response({"exists": exists})


# ======================================
# ADMIN USERS
# ======================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdministrador])
def admin_users(request):

    if request.method == "GET":
        users = User.objects.all().order_by("username")
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data)

    serializer = AdminUserSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data, status=201)


# ======================================
# ADMIN USER DETAIL
# ======================================

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsAdministrador])
def admin_user_detail(request, user_id):

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)

    if request.method == "GET":
        serializer = AdminUserSerializer(user)
        return Response(serializer.data)

    if request.method == "DELETE":

        if user == request.user:
            return Response({
                "error": "No puedes eliminar tu propio usuario."
            }, status=400)

        user.delete()
        return Response(status=204)

    serializer = AdminUserSerializer(
        user,
        data=request.data,
        partial=request.method == "PATCH"
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)


# ======================================
# FORGOT PASSWORD
# ======================================

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):

    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Email not found"}, status=404)

    code = random.randint(100000, 999999)

    user.last_name = str(code)
    user.save()

    send_mail(
        'Password Reset Code',
        f'Your recovery code is: {code}',
        'noreply@referenciate.com',
        [email],
        fail_silently=False,
    )

    return Response({
        "message": "Recovery code sent to email"
    })


# ======================================
# RESET PASSWORD
# ======================================

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):

    email = request.data.get("email")
    code = request.data.get("code")
    new_password = request.data.get("new_password")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Email not found"}, status=404)

    if user.last_name != str(code):
        return Response({"error": "Invalid code"}, status=400)

    user.set_password(new_password)
    user.last_name = ""
    user.save()

    return Response({
        "message": "Password updated successfully"
    })