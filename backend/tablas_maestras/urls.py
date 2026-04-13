from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    TEmpresasViewSet, TCiudadesViewSet,
    TPuntajeColorViewSet, TTipoReporteViewSet
)

router = DefaultRouter()
router.register(r'empresas', TEmpresasViewSet, basename='empresas')
router.register(r'ciudades', TCiudadesViewSet, basename='ciudades')
router.register(r'puntaje-color', TPuntajeColorViewSet, basename='puntaje-color')
router.register(r'tipo-reporte', TTipoReporteViewSet, basename='tipo-reporte')

urlpatterns = router.urls
