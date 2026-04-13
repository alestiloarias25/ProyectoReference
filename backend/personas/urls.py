from rest_framework.routers import DefaultRouter
from .views import PersonaViewSet, TEmpresasViewSet, TCiudadesViewSet

router = DefaultRouter()
router.register(r'persona', PersonaViewSet, basename='persona')
router.register(r'empresas', TEmpresasViewSet, basename='empresas')
router.register(r'ciudades', TCiudadesViewSet, basename='ciudades')

urlpatterns = router.urls
