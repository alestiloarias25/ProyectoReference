from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContratoArriendoViewSet

# ✅ DEFINIR EL ROUTER
router = DefaultRouter()
router.register(r'contratos', ContratoArriendoViewSet, basename='contratos')

urlpatterns = [
    path('', include(router.urls)),
]