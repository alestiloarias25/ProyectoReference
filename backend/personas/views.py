from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Persona
from .serializers import PersonaSerializer, TEmpresasSerializer, TCiudadesSerializer
from tablas_maestras.models import TEmpresas, TCiudades


class PersonaViewSet(ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
    permission_classes = [IsAuthenticated]


class TEmpresasViewSet(ModelViewSet):
    queryset = TEmpresas.objects.all()
    serializer_class = TEmpresasSerializer
    permission_classes = [IsAuthenticated]


class TCiudadesViewSet(ModelViewSet):
    queryset = TCiudades.objects.all()
    serializer_class = TCiudadesSerializer
    permission_classes = [IsAuthenticated]
