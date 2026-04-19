from rest_framework.viewsets import ModelViewSet
from django.db import models
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ContratoArriendo
from .serializers import ContratoArriendoSerializer
from usuarios.permissions import IsAdministradorOrArrendador, get_user_role, ROLE_ADMINISTRADOR

class ContratoArriendoViewSet(ModelViewSet):
    queryset = ContratoArriendo.objects.all()
    serializer_class = ContratoArriendoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAdministradorOrArrendador]

    def get_queryset(self):
        queryset = ContratoArriendo.objects.all()
        if get_user_role(self.request.user) == ROLE_ADMINISTRADOR:
            return queryset
            
        username = self.request.user.username
        return queryset.filter(
            models.Q(username=username) | 
            models.Q(personas__TPNoDocumento=username, personas__TCARTipoParticipacion='ARRENDADOR')
        ).distinct()
