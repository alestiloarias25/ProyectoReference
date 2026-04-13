from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from .models import Autor, Profesion
from .serializers import AutorSerializer, ProfesionSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
    
from django.contrib.auth.decorators import login_required

from django.shortcuts import redirect
from django.contrib.auth.views import LoginView


class AutorViewSet(viewsets.ModelViewSet):
    queryset = Autor.objects.all()
    serializer_class = AutorSerializer
    

class ProfesionViewSet(viewsets.ModelViewSet):
    queryset = Profesion.objects.all()
    serializer_class = ProfesionSerializer
    permission_classes = [IsAuthenticated]
    

@api_view(['POST'])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=400)

    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "user": user.username
    })    


@login_required
def menu_referencias(request):
    return render(request, "referencias/menu.html")

@login_required
def contrato_view(request):
    return render(request, "referencias/contrato.html")

@login_required
def reportar_view(request):
    return render(request, "referencias/reportar.html")

@login_required
def consultar_view(request):
    return render(request, "referencias/consultar.html")



def login_redirect(request):
    if request.user.is_authenticated:
        return redirect('/referencias/')  # Redirige si el usuario ya está logueado
    return LoginView.as_view()(request)  # Si no está logueado, muestra el formulario