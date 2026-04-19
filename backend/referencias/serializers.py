from rest_framework import serializers
from .models import THistorial
from tablas_maestras.models import TTipoReporte, TPuntajeColor
from usuarios.permissions import get_user_role, ROLE_ADMINISTRADOR


class TTipoReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TTipoReporte
        fields = ['TRHTipoReporte', 'TRDescripcion', 'TRPeso']


class TPuntajeColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TPuntajeColor
        fields = ['TPCNivel', 'TPCValorInicial', 'TPCValorFinal', 'TPCColor', 'TPCEvaluacion', 'TPCComentario']

    def validate(self, data):
        """Valida que los rangos no se solapen"""
        valor_inicial = data.get('TPCValorInicial')
        valor_final = data.get('TPCValorFinal')
        
        if valor_inicial >= valor_final:
            raise serializers.ValidationError(
                "El valor inicial debe ser menor que el valor final"
            )
        
        # Verificar que no se solape con otros rangos
        nivel_actual = getattr(self.instance, 'TPCNivel', None)
        rangos_existentes = TPuntajeColor.objects.exclude(TPCNivel=nivel_actual)
        
        for rango in rangos_existentes:
            if (valor_inicial <= rango.TPCValorFinal and valor_final >= rango.TPCValorInicial):
                raise serializers.ValidationError(
                    f"El rango se solapa con el nivel '{rango.TPCNivel}' "
                    f"({rango.TPCValorInicial}-{rango.TPCValorFinal})"
                )
        
        return data


class THistorialSerializer(serializers.ModelSerializer):
    TRHTipoReporte_nombre = serializers.CharField(source='TRHTipoReporte.TRHTipoReporte', read_only=True)
    TCAIDContrato_info = serializers.SerializerMethodField(read_only=True)
    fecha_entrega_inmueble = serializers.DateField(write_only=True, required=False)

    class Meta:
        model = THistorial
        fields = [
            'TRHId',
            'TCAIDContrato',
            'TCAIDContrato_info',
            'TRHTipoReporte',
            'TRHTipoReporte_nombre',
            'TRHValorAdeudado',
            'TRHObservacion',
            'TRHFechaReporte',
            'TUUserName',
            'fecha_entrega_inmueble'
        ]
        read_only_fields = ['TRHId', 'TRHFechaReporte']

    def get_TCAIDContrato_info(self, obj):
        """Retorna información del contrato"""
        return {
            'TCAIDContrato': obj.TCAIDContrato.TCAIDContrato,
            'TBNoMatricula': obj.TCAIDContrato.TBNoMatricula,
            'TBDireccion': obj.TCAIDContrato.TBDireccion,
            'TCAValorCanonContrato': str(obj.TCAIDContrato.TCAValorCanonContrato),
            'TCAFechaContrato': obj.TCAIDContrato.TCAFechaContrato,
            'TCAFechaEntregaInmueble': obj.TCAIDContrato.TCAFechaEntregaInmueble,
        }

    def validate(self, data):
        """Valida que solo exista un tipo de reporte por contrato"""
        contrato = data.get('TCAIDContrato')
        tipo_reporte = data.get('TRHTipoReporte')
        request = self.context.get('request')

        if request and get_user_role(request.user) != ROLE_ADMINISTRADOR:
            if contrato and contrato.username != request.user.username:
                raise serializers.ValidationError(
                    "No tienes permiso para reportar sobre este contrato."
                )

        # Si estamos actualizando, excluir el registro actual
        if self.instance:
            existe = THistorial.objects.filter(
                TCAIDContrato=contrato,
                TRHTipoReporte=tipo_reporte
            ).exclude(TRHId=self.instance.TRHId).exists()
        else:
            # Si es creación, verificar que no exista
            existe = THistorial.objects.filter(
                TCAIDContrato=contrato,
                TRHTipoReporte=tipo_reporte
            ).exists()

        if existe:
            raise serializers.ValidationError(
                f"Ya existe un reporte del tipo '{tipo_reporte.TRHTipoReporte}' para este contrato."
            )

        if tipo_reporte:
            tipo_cod = getattr(tipo_reporte, 'TRHTipoReporte', '')
            if tipo_cod in ['AR', 'DA', 'SE', 'US']:
                if not data.get('fecha_entrega_inmueble'):
                    raise serializers.ValidationError({"fecha_entrega_inmueble": f"Se requiere la Fecha de Entrega del Bien Inmueble para el tipo de reporte {tipo_cod}."})

        return data

    def create(self, validated_data):
        fecha_entrega = validated_data.pop('fecha_entrega_inmueble', None)
        historial = super().create(validated_data)
        
        if fecha_entrega:
            contrato = historial.TCAIDContrato
            contrato.TCAFechaEntregaInmueble = fecha_entrega
            contrato.save()
            
        return historial
