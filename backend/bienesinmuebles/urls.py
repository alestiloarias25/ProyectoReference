from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TbienesInmueblesViewSet

router = DefaultRouter()
router.register(r'bienesinmuebles', TbienesInmueblesViewSet)

urlpatterns = router.urls
