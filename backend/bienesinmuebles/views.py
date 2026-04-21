from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import TbienesInmuebles, FotoInmueble
from .serializers import TbienesInmueblesSerializer, FotoInmuebleSerializer
from usuarios.permissions import IsAdministradorOrArrendador, get_user_role, ROLE_ADMINISTRADOR

class TbienesInmueblesViewSet(viewsets.ModelViewSet):
    queryset = TbienesInmuebles.objects.all()
    serializer_class = TbienesInmueblesSerializer

    def get_permissions(self):
        if self.action == 'buscar':
            return [IsAuthenticated()]
        return [IsAdministradorOrArrendador()]

    def get_queryset(self):
        queryset = TbienesInmuebles.objects.all()
        if get_user_role(self.request.user) == ROLE_ADMINISTRADOR:
            return queryset
        
        # If the user is just fetching their own list
        if self.action == 'list' and 'search_address' not in self.request.query_params:
            return queryset.filter(username=self.request.user.username)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(username=self.request.user.username)

    @action(detail=True, methods=['post'], url_path='upload_photo')
    def upload_photo(self, request, pk=None):
        inmueble = self.get_object()
        # Verify ownership
        if get_user_role(self.request.user) != ROLE_ADMINISTRADOR and inmueble.username != request.user.username:
            return Response({"detail": "No tienes permiso para modificar este inmueble."}, status=status.HTTP_403_FORBIDDEN)
            
        file = request.FILES.get('imagen')
        if not file:
            return Response({"detail": "No se proporcionó ninguna imagen."}, status=status.HTTP_400_BAD_REQUEST)

        foto = FotoInmueble.objects.create(inmueble=inmueble, imagen=file)
        serializer = FotoInmuebleSerializer(foto)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    @action(detail=False, methods=['get'], url_path='buscar')
    def buscar(self, request):
        direccion = request.query_params.get('direccion', '')
        queryset = TbienesInmuebles.objects.all()
        if direccion:
            queryset = queryset.filter(TBDireccion__icontains=direccion)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
