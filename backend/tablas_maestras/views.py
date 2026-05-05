from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import TEmpresas, TCiudades, TPuntajeColor, TTipoReporte
from .serializers import (
    TEmpresasSerializer, TCiudadesSerializer,
    TPuntajeColorSerializer, TTipoReporteSerializer
)


class TEmpresasViewSet(ModelViewSet):
    """
    API ViewSet para gestionar Empresas.
    Permite crear, leer, actualizar y eliminar empresas.
    """
    queryset = TEmpresas.objects.all()
    serializer_class = TEmpresasSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['TENombre', 'TEDescripcion', 'TENit', 'TEEmail']
    ordering_fields = ['TEId', 'TENombre', 'TEFechaCreacion']
    ordering = ['TEId']


class TCiudadesViewSet(ModelViewSet):
    """
    API ViewSet para gestionar Ciudades.
    Permite crear, leer, actualizar y eliminar ciudades.
    """
    queryset = TCiudades.objects.all()
    serializer_class = TCiudadesSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['TCNombre', 'TCDepartamento']
    ordering_fields = ['TCId', 'TCNombre', 'TCFechaCreacion']
    ordering = ['TCId']


class TPuntajeColorViewSet(ModelViewSet):
    """
    API ViewSet para gestionar Configuración de Colores de Puntaje.
    Permite crear, leer, actualizar y eliminar configuraciones de colores.
    """
    queryset = TPuntajeColor.objects.all()
    serializer_class = TPuntajeColorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ['TPCValorInicial']
    ordering = ['TPCValorInicial']


class TTipoReporteViewSet(ModelViewSet):
    """
    API ViewSet para gestionar Tipos de Reporte.
    Permite crear, leer, actualizar y eliminar tipos de reporte.
    """
    queryset = TTipoReporte.objects.all()
    serializer_class = TTipoReporteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['TRHTipoReporte', 'TRDescripcion']
    ordering_fields = ['TRHTipoReporte', 'TRPeso']
    ordering = ['TRHTipoReporte']
