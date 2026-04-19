"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from autores.views import AutorViewSet, ProfesionViewSet
from django.contrib.auth import views as auth_views
from personas.views import PersonaViewSet
from contrato.views import ContratoArriendoViewSet
from bienesinmuebles.views import TbienesInmueblesViewSet

router = DefaultRouter()
router.register(r'autores', AutorViewSet)
router.register(r'profesiones', ProfesionViewSet)
router.register(r'persona', PersonaViewSet)
router.register(r"bienesinmuebles", TbienesInmueblesViewSet, basename="bienesinmuebles")
router.register(r'contratoarriendo', ContratoArriendoViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),          # endpoints de autores ya expuestos
    path('api/', include('personas.urls')),      # <-- Agregar endpoints de personas, empresas y ciudades
    path('api/auth/', include('usuarios.urls')),  # <-- login estará en /api/auth/login/
    path('api/tablas-maestras/', include('tablas_maestras.urls')),  # Nueva app de tablas maestras
    path('referencias/', include('referencias.urls')),
    path('login/', auth_views.LoginView.as_view(), name='login'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
