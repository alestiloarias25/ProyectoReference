from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tiporeporte', views.TTipoReporteViewSet, basename='tiporeporte')
router.register(r'historial', views.THistorialViewSet, basename='historial')
router.register(r'puntajecolor', views.TPuntajeColorViewSet, basename='puntajecolor')
router.register(r'consultar-puntaje', views.ConsultarPuntajeArrendatarioViewSet, basename='consultar-puntaje')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', views.menu_referencias, name="menu_referencias"),
    path('contrato', views.contrato_view, name="contrato"),
    path('reportar', views.reportar_view, name="reportar"),
    path('consultar', views.consultar_view, name="consultar"),
    path('login/', views.login_redirect, name='login'),
]




