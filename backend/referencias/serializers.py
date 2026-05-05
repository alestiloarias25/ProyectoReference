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
    total_pagado = serializers.SerializerMethodField(read_only=True)
    saldo = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = THistorial
        fields = [
            'TRHId',
            'TCAIDContrato',
            'TCAIDContrato_info',
            'TRHTipoReporte',
            'TRHTipoReporte_nombre',
            'TRHValorAdeudado',
            'total_pagado',
            'saldo',
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

    def get_total_pagado(self, obj):
        from django.db.models import Sum
        total = obj.pagos.aggregate(total=Sum('TRHValorPagado'))['total']
        return total if total else 0

    def get_saldo(self, obj):
        valor_adeudado = obj.TRHValorAdeudado if obj.TRHValorAdeudado else 0
        return float(valor_adeudado) - float(self.get_total_pagado(obj))

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
            if tipo_cod in ['AR', 'DA', 'SE', 'US', 'OC']:
                # Block negative reports on contracts that are already closed or finalizados without debt
                contrato_obj = data.get('TCAIDContrato', getattr(self.instance, 'TCAIDContrato', None))
                contrato_finalizado = contrato_obj and contrato_obj.TCAFechaEntregaInmueble is not None
                if contrato_finalizado or THistorial.objects.filter(TCAIDContrato=contrato, TRHTipoReporte__TRHTipoReporte='CF').exists():
                    raise serializers.ValidationError("No se pueden cargar reportes negativos en un contrato finalizado sin deuda (CF) o con Fecha de Entrega.")

            if tipo_cod in ['AR', 'DA', 'SE', 'US', 'OC', 'CF']:
                # Si estamos creando o si no tiene fecha, la pedimos
                contrato_obj = data.get('TCAIDContrato', getattr(self.instance, 'TCAIDContrato', None))
                ya_tiene_fecha = contrato_obj and contrato_obj.TCAFechaEntregaInmueble is not None
                if not data.get('fecha_entrega_inmueble') and not ya_tiene_fecha:
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

class ThistorialPagosSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import ThistorialPagos
        model = ThistorialPagos
        fields = [
            'THPId',
            'TRHId',
            'TCAIDContrato',
            'TRHFechaPago',
            'TRHValorPagado',
            'TRHPobservacion',
            'TUUserName'
        ]
        read_only_fields = ['THPId', 'TUUserName']

    def validate(self, data):
        # Validate that only Arrendador can create payments for their properties
        request = self.context.get('request')
        contrato = data.get('TCAIDContrato')
        
        if request and get_user_role(request.user) != ROLE_ADMINISTRADOR:
            if contrato and contrato.username != request.user.username:
                raise serializers.ValidationError("No tienes permiso para registrar pagos sobre este contrato.")
        
        reporte = data.get('TRHId')
        valor_pagado = data.get('TRHValorPagado')

        if reporte and valor_pagado is not None:
            from django.db.models import Sum
            pagos_previos = reporte.pagos.aggregate(total=Sum('TRHValorPagado'))['total'] or 0
            
            if self.instance:
                pagos_previos -= self.instance.TRHValorPagado

            valor_adeudado = reporte.TRHValorAdeudado or 0
            saldo_actual = valor_adeudado - pagos_previos

            if valor_pagado > saldo_actual:
                raise serializers.ValidationError({
                    "TRHValorPagado": f"El valor a pagar ({valor_pagado}) supera el saldo adeudado ({saldo_actual})."
                })

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        username = request.user.username if request and hasattr(request, 'user') else 'system'
        validated_data['TUUserName'] = username
        return super().create(validated_data)

