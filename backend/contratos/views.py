from rest_framework import viewsets
from .models import TbienesInmuebles
from .serializers import TbienesInmueblesSerializer
from usuarios.permissions import IsAdministradorOrArrendador, get_user_role, ROLE_ADMINISTRADOR

class TbienesInmueblesViewSet(viewsets.ModelViewSet):
    queryset = TbienesInmuebles.objects.all()
    serializer_class = TbienesInmueblesSerializer
    permission_classes = [IsAdministradorOrArrendador]

    def get_queryset(self):
        queryset = TbienesInmuebles.objects.all()
        if get_user_role(self.request.user) == ROLE_ADMINISTRADOR:
            return queryset
        return queryset.filter(username=self.request.user.username)

    def perform_create(self, serializer):
        serializer.save(username=self.request.user.username)
