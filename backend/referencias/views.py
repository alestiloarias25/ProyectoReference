# Create your views here.
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.contrib.auth.views import LoginView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import THistorial
from tablas_maestras.models import TTipoReporte, TPuntajeColor
from .serializers import TTipoReporteSerializer, THistorialSerializer, TPuntajeColorSerializer
from .services import RecalculoPuntajeService, DetalleRecalculoService
from contrato.models import ContratoArriendoRelacion
from usuarios.permissions import IsAdministrador, IsAdministradorOrArrendador, IsAdministradorOrArrendadorReadOnly, CanEvaluateArrendatario, get_user_role


class TTipoReporteViewSet(ModelViewSet):
    queryset = TTipoReporte.objects.all()
    serializer_class = TTipoReporteSerializer
    permission_classes = [IsAdministradorOrArrendadorReadOnly]


class TPuntajeColorViewSet(ModelViewSet):
    queryset = TPuntajeColor.objects.all()
    serializer_class = TPuntajeColorSerializer
    permission_classes = [IsAdministrador]


class THistorialViewSet(ModelViewSet):
    queryset = THistorial.objects.all()
    serializer_class = THistorialSerializer
    permission_classes = [IsAdministradorOrArrendador]

    def get_queryset(self):
        queryset = THistorial.objects.all()
        if get_user_role(self.request.user) != "ADMINISTRADOR":
            queryset = queryset.filter(TUUserName=self.request.user.username)
            
        contrato_id = self.request.query_params.get('TCAIDContrato', None)
        if contrato_id is not None:
            queryset = queryset.filter(TCAIDContrato_id=contrato_id)
            
        return queryset

    def get_serializer(self, *args, **kwargs):
        if "data" in kwargs:
            data = kwargs["data"]
            if isinstance(data, list):
                kwargs["many"] = True
        return super().get_serializer(*args, **kwargs)

    def perform_create(self, serializer):
        """Captura automáticamente el usuario actual al crear un reporte"""
        # Obtén el nombre de usuario del usuario autenticado
        username = self.request.user.username
        instances = serializer.save(TUUserName=username)
        
        if not isinstance(instances, list):
            instances = [instances]
            
        # Dispara el recálculo de puntaje automáticamente
        contratos_ids = set([inst.TCAIDContrato_id for inst in instances])
        for cid in contratos_ids:
            self._recalcular_puntajes_arrendatarios(cid)

    def perform_update(self, serializer):
        """Al actualizar un reporte, recalcula los puntajes"""
        historial = serializer.save()
        self._recalcular_puntajes_arrendatarios(historial.TCAIDContrato_id)

    @staticmethod
    def _recalcular_puntajes_arrendatarios(tca_id_contrato):
        """Recalcula los puntajes de todos los arrendatarios del contrato"""
        try:
            RecalculoPuntajeService.recalcular_puntaje_por_contrato(tca_id_contrato)
        except Exception as e:
            print(f"Error al recalcular puntajes: {str(e)}")

    @action(detail=False, methods=['post'], permission_classes=[IsAdministrador])
    def recalcular_puntaje(self, request):
        """
        Endpoint para recalcular manualmente el puntaje de un arrendatario
        POST /api/historial/recalcular_puntaje/
        {
            "tp_no_documento": "1234567890"
        }
        """
        tp_no_documento = request.data.get('tp_no_documento')
        if not tp_no_documento:
            return Response(
                {'error': 'tp_no_documento es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resultado = RecalculoPuntajeService.recalcular_puntaje(tp_no_documento)
        
        if resultado['success']:
            return Response(resultado, status=status.HTTP_200_OK)
        else:
            return Response(resultado, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], permission_classes=[IsAdministrador])
    def recalcular_por_contrato(self, request):
        """
        Endpoint para recalcular puntajes de todos los arrendatarios de un contrato
        POST /api/historial/recalcular_por_contrato/
        {
            "tca_id_contrato": 1
        }
        """
        tca_id_contrato = request.data.get('tca_id_contrato')
        if not tca_id_contrato:
            return Response(
                {'error': 'tca_id_contrato es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resultados = RecalculoPuntajeService.recalcular_puntaje_por_contrato(tca_id_contrato)
        
        return Response({
            'tca_id_contrato': tca_id_contrato,
            'cantidad_procesados': len(resultados),
            'resultados': resultados
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAdministrador])
    def detalles_calculo(self, request):
        """
        Endpoint para obtener detalles del cálculo de puntaje (para debugging)
        GET /api/historial/detalles_calculo/?tp_no_documento=1234567890
        """
        tp_no_documento = request.query_params.get('tp_no_documento')
        if not tp_no_documento:
            return Response(
                {'error': 'tp_no_documento es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        detalles = DetalleRecalculoService.obtener_detalles_calculo(tp_no_documento)
        return Response(detalles, status=status.HTTP_200_OK)


class ConsultarPuntajeArrendatarioViewSet(ModelViewSet):
    """ViewSet para consultar el puntaje y el color correspondiente de un arrendatario"""
    queryset = TPuntajeColor.objects.all()
    serializer_class = TPuntajeColorSerializer
    permission_classes = [CanEvaluateArrendatario]
    basename = 'consultar-puntaje'

    @action(detail=False, methods=['get'], permission_classes=[CanEvaluateArrendatario])
    def por_documento(self, request):
        """
        Endpoint para consultar el puntaje y color de un arrendatario
        GET /api/consultar-puntaje/por_documento/?tp_no_documento=1234567890
        
        Retorna:
        {
            "tp_no_documento": "1234567890",
            "tp_nombres": "Juan",
            "tp_apellidos": "Perez",
            "tp_puntaje": 850,
            "tp_nivel": "BUENO",
            "tp_color": "#17a2b8",
            "tp_porcentaje": 85,
            "mensaje_evaluacion": "Arrendatario confiable"
        }
        """
        from personas.models import Persona
        
        tp_no_documento = request.query_params.get('tp_no_documento')
        
        if not tp_no_documento:
            return Response(
                {'error': 'tp_no_documento es requerido como parámetro de consulta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            persona = Persona.objects.get(TPNoDocumento=tp_no_documento)
        except Persona.DoesNotExist:
            return Response(
                {'error': f'No se encontró persona con documento: {tp_no_documento}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        puntaje = persona.TPPuntaje
        
        # Buscar el rango de color correspondiente
        rango_color = TPuntajeColor.objects.filter(
            TPCValorInicial__lte=puntaje,
            TPCValorFinal__gte=puntaje
        ).first()
        
        if not rango_color:
            return Response(
                {'error': 'No se encontró rango de color para el puntaje'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calcular porcentaje (0-100)
        porcentaje = round((puntaje / 1000) * 100, 1)
        
        # Generar mensaje de evaluación
        mensajes = {
            'EXCELENTE': 'Excelente arrendatario - Muy confiable',
            'BUENO': 'Buen arrendatario - Confiable',
            'REGULAR': 'Arrendatario regular - Requiere seguimiento',
            'MALO': 'Mal arrendatario - Requiere precaución',
            'CRÍTICO': 'Arrendatario crítico - Alto riesgo'
        }
        
        return Response({
            'tp_no_documento': persona.TPNoDocumento,
            'tp_tipo_documento': persona.TPTipoDocumento,
            'tp_nombres': persona.TPNombres,
            'tp_apellidos': persona.TPApellidos,
            'tp_direccion': persona.TPDireccionResidencia,
            'tp_celular': persona.TPCelular1,
            'tp_puntaje': puntaje,
            'tp_nivel': rango_color.TPCNivel,
            'tp_color': rango_color.TPCColor,
            'tp_porcentaje': porcentaje,
            'tp_valor_initial': rango_color.TPCValorInicial,
            'tp_valor_final': rango_color.TPCValorFinal,
            'mensaje_evaluacion': mensajes.get(rango_color.TPCNivel, 'Sin clasificación'),
            'tp_evaluacion': rango_color.TPCEvaluacion,
            'tp_comentario': rango_color.TPCComentario
        }, status=status.HTTP_200_OK)


@login_required
def menu_referencias(request):
    return render(
        request,
        "referencias/menu.html",
        {
            "role": get_user_role(request.user),
            "section_label": "Centro de operaciones",
            "page_title": "Menu de referencias",
            "page_description": "Navega por contratos, reportes y consultas dentro de una interfaz comun y consistente.",
        },
    )

@login_required
def contrato_view(request):
    if get_user_role(request.user) not in ("ADMINISTRADOR", "ARRENDADOR"):
        return redirect('/referencias/')
    return render(
        request,
        "referencias/contrato.html",
        {
            "role": get_user_role(request.user),
            "section_label": "Modulo operativo",
            "page_title": "Registrar y editar contratos",
            "page_description": "Vista preparada para mantener la misma experiencia visual mientras se administran contratos.",
        },
    )

@login_required
def reportar_view(request):
    if get_user_role(request.user) not in ("ADMINISTRADOR", "ARRENDADOR"):
        return redirect('/referencias/')
    return render(
        request,
        "referencias/reportar.html",
        {
            "role": get_user_role(request.user),
            "section_label": "Modulo operativo",
            "page_title": "Reportar referencia",
            "page_description": "Pantalla homologada para registrar reportes sin romper la continuidad visual de la aplicacion.",
        },
    )

@login_required
def consultar_view(request):
    if get_user_role(request.user) not in ("ADMINISTRADOR", "ARRENDADOR", "ARRENDATARIO"):
        return redirect('/referencias/')
    return render(
        request,
        "referencias/consultar.html",
        {
            "role": get_user_role(request.user),
            "section_label": "Modulo de consulta",
            "page_title": "Consultar referencia",
            "page_description": "Consulta informacion desde una pantalla con el mismo sistema de colores, botones y navegacion.",
        },
    )


def login_redirect(request):
    if request.user.is_authenticated:
        return redirect('/referencias/')  # Redirige si el usuario ya está logueado
    return LoginView.as_view()(request)  # Si no está logueado, muestra el formulario

