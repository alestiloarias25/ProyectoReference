from django.urls import path
from .views import login
from autores.views import AutorViewSet, ProfesionViewSet


urlpatterns = [
    path('', views.menu_referencias, name="menu_referencias"),
    path('contrato', views.contrato_view, name="contrato"),
    path('reportar', views.reportar_view, name="reportar"),
    path('consultar', views.consultar_view, name="consultar"),
    path('login/', views.login_redirect, name='login'),
]