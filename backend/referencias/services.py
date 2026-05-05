"""
Servicio para recalcular el puntaje de arrendatarios basado en su historial de reportes.

Fórmula: TPPuntaje = 1000 – (PenalizaciónTotal * 10)
Donde: PenalizaciónTotal = (CantidadReportes * 25%) + (TipoReporte * 30%) + (ValorAdeudado * 30%) + (Recencia * 15%)
"""

from datetime import datetime, timedelta
from django.utils import timezone
from django.db import connection
from decimal import Decimal
from contrato.models import ContratoArriendoRelacion
from personas.models import Persona
from .models import THistorial, TTipoReporte


class RecalculoPuntajeService:
    """Servicio para recalcular el puntaje de arrendatarios"""

    @staticmethod
    def get_cantidad_reportes_score(cantidad):
        """
        Valida la cantidad de reportes y retorna el puntaje
        CantidadReportes: 0=0, 1=20, 2=40, 3=60, 4=80, 5+=100
        Acepta decimales para revertir proporcionalmente la afectación según pagos.
        """
        return min(100, float(cantidad) * 20)

    @staticmethod
    def get_tipo_reporte_weight(tipo_reporte_id):
        """
        Obtiene el peso del tipo de reporte de la tabla TTipoReporte
        Si no existe, usa valores por defecto: OC=100, AR=80, SE=60, DA=50, US=30
        """
        try:
            tipo_reporte = TTipoReporte.objects.get(TRHTipoReporte=tipo_reporte_id)
            if tipo_reporte.TRPeso is not None:
                return tipo_reporte.TRPeso
        except TTipoReporte.DoesNotExist:
            pass
        
        # Valores por defecto si no tiene peso definido
        default_weights = {
            'OC': 100,
            'AR': 80,
            'SE': 60,
            'DA': 50,
            'US': 30
        }
        return default_weights.get(tipo_reporte_id, 50)

    @staticmethod
    def get_valor_adeudado_score(valor_total):
        """
        Calcula el puntaje según los rangos de valor adeudado
        (0)=0, ($1 a $300.000)=20, ($300.001 a $700.000)=40,
        ($700.001 a $1'000.000)=60, ($1'000.001 a $1'400.000)=80, ($1'400.001+)=100
        """
        if valor_total <= 0:
            return 0
        elif valor_total <= 300000:
            return 20
        elif valor_total <= 700000:
            return 40
        elif valor_total <= 1000000:
            return 60
        elif valor_total <= 1400000:
            return 80
        else:
            return 100

    @staticmethod
    def get_recencia_score(fecha_reporte):
        """
        Calcula el puntaje según la antigüedad del reporte
        (<3 meses)=100, (3 a 6 meses)=90, (6 a 12 meses)=70,
        (12 a 24 meses)=50, (24+ meses)=30
        """
        if not fecha_reporte:
            return 30
        
        ahora = timezone.now()
        dias_transcurridos = (ahora - fecha_reporte).days
        
        if dias_transcurridos < 90:  # < 3 meses
            return 100
        elif dias_transcurridos < 180:  # 3 a 6 meses
            return 90
        elif dias_transcurridos < 365:  # 6 a 12 meses
            return 70
        elif dias_transcurridos < 730:  # 12 a 24 meses
            return 50
        else:  # 24+ meses
            return 30

    @staticmethod
    def obtener_reportes_arrendatario(tp_no_documento):
        """
        Obtiene todos los reportes asociados a un arrendatario
        """
        return THistorial.objects.filter(
            TCAIDContrato__personas__TPNoDocumento=tp_no_documento,
            TCAIDContrato__personas__TCARTipoParticipacion__in=['ARRENDATARIO', 'CODEUDOR']
        ).select_related('TRHTipoReporte', 'TCAIDContrato')

    @staticmethod
    def get_factor_deuda(reporte):
        """
        Calcula el factor de deuda de 0 a 1, donde 1 es deuda completa y 0 es pagado totalmente.
        """
        valor_adeudado = float(reporte.TRHValorAdeudado or 0)
        if valor_adeudado <= 0:
            return 1.0
        from django.db.models import Sum
        pagos_sum = reporte.pagos.aggregate(total=Sum('TRHValorPagado'))['total'] or 0
        pagos_sum = float(pagos_sum)
        factor = 1.0 - (pagos_sum / valor_adeudado)
        return max(0.0, min(1.0, factor))

    @classmethod
    def calcular_penalizacion_total(cls, tp_no_documento):
        """
        Calcula la penalización total según la fórmula:
        PenalizaciónTotal = (CantidadReportes * 25%) + (TipoReporte * 30%) + 
                           (ValorAdeudado * 30%) + (Recencia * 15%)
        Aplica un factor_deuda para reducir la penalización proporcionalmente a los pagos.
        """
        reportes = cls.obtener_reportes_arrendatario(tp_no_documento)
        
        if not reportes.exists():
            return 0
            
        ahora = timezone.now()
        
        # Separar reportes
        reportes_cf = [r for r in reportes if r.TRHTipoReporte.TRHTipoReporte == 'CF']
        # Reportes negativos aplicables (enseguida)
        reportes_negativos_aplicables = [r for r in reportes if r.TRHTipoReporte.TRHTipoReporte != 'CF']
        
        penalizacion_total = 0
        
        if reportes_negativos_aplicables:
            factores_deuda = [cls.get_factor_deuda(r) for r in reportes_negativos_aplicables]
            cantidad_total = len(reportes_negativos_aplicables)

            # 1. Cantidad de reportes (efectiva)
            cantidad_efectiva = sum(factores_deuda)
            cantidad_score = cls.get_cantidad_reportes_score(cantidad_efectiva)
            cantidad_ponderado = (cantidad_score / 100) * 25  # 25%
            
            # 2. Tipo de reporte (promedio de pesos afectado por pagos)
            tipo_scores = []
            for r, factor in zip(reportes_negativos_aplicables, factores_deuda):
                peso = cls.get_tipo_reporte_weight(r.TRHTipoReporte.TRHTipoReporte)
                tipo_scores.append(peso * factor)
            
            tipo_promedio = sum(tipo_scores) / cantidad_total if cantidad_total > 0 else 50
            tipo_ponderado = (tipo_promedio / 100) * 30  # 30%
            
            # 3. Valor adeudado total (saldos)
            valor_total = sum(
                float(r.TRHValorAdeudado or 0) * factor for r, factor in zip(reportes_negativos_aplicables, factores_deuda)
            )
            valor_score = cls.get_valor_adeudado_score(valor_total)
            valor_ponderado = (valor_score / 100) * 30  # 30%
            
            # 4. Recencia (promedio afectado por pagos)
            recencia_scores = []
            for r, factor in zip(reportes_negativos_aplicables, factores_deuda):
                score = cls.get_recencia_score(r.TRHFechaReporte)
                recencia_scores.append(score * factor)
            
            recencia_promedio = sum(recencia_scores) / cantidad_total if cantidad_total > 0 else 10
            recencia_ponderado = (recencia_promedio / 100) * 15  # 15%
            
            penalizacion_total = cantidad_ponderado + tipo_ponderado + valor_ponderado + recencia_ponderado
            
        # Aplicar el beneficio de CF como un bono fijo de 50 puntos de puntaje real
        if reportes_cf:
            bonificacion_cf = 5  # 5 unidades de penalización equivale a 50 puntos en el puntaje final
            penalizacion_total -= bonificacion_cf * len(reportes_cf)

        return max(0, penalizacion_total)

    @classmethod
    def calcular_nuevo_puntaje(cls, tp_no_documento):
        """
        Calcula el nuevo puntaje: TPPuntaje = 1000 – (PenalizaciónTotal * 10)
        """
        penalizacion = cls.calcular_penalizacion_total(tp_no_documento)
        nuevo_puntaje = 1000 - (penalizacion * 10)
        
        # Asegurar que el puntaje no sea negativo
        return max(int(nuevo_puntaje), 0)

    @classmethod
    def recalcular_puntaje(cls, tp_no_documento):
        """
        Recalcula y actualiza el puntaje de un arrendatario en la tabla TPersonas
        """
        try:
            persona = Persona.objects.get(TPNoDocumento=tp_no_documento)
            nuevo_puntaje = cls.calcular_nuevo_puntaje(tp_no_documento)
            
            persona.TPPuntaje = nuevo_puntaje
            persona.save(update_fields=['TPPuntaje'])
            
            return {
                'success': True,
                'TPNoDocumento': tp_no_documento,
                'TPPuntaje': nuevo_puntaje,
                'mensaje': f'Puntaje actualizado a {nuevo_puntaje}'
            }
        except Persona.DoesNotExist:
            return {
                'success': False,
                'error': f'Persona con documento {tp_no_documento} no existe',
                'TPNoDocumento': tp_no_documento
            }

    @classmethod
    def recalcular_puntaje_por_contrato(cls, tca_id_contrato):
        """
        Recalcula el puntaje de todos los arrendatarios asociados a un contrato
        """
        arrendatarios = ContratoArriendoRelacion.objects.filter(
            TCAIDContrato_id=tca_id_contrato,
            TCARTipoParticipacion__in=['ARRENDATARIO', 'CODEUDOR']
        ).values_list('TPNoDocumento', flat=True)
        
        resultados = []
        for tp_no_documento in arrendatarios:
            resultado = cls.recalcular_puntaje(tp_no_documento)
            resultados.append(resultado)
        
        return resultados


class DetalleRecalculoService:
    """Servicio para obtener detalles del cálculo de puntaje (para debugging)"""
    
    @staticmethod
    def obtener_detalles_calculo(tp_no_documento):
        """
        Retorna un diccionario con todos los detalles del cálculo
        """
        reportes = THistorial.objects.filter(
            TCAIDContrato__personas__TPNoDocumento=tp_no_documento,
            TCAIDContrato__personas__TCARTipoParticipacion__in=['ARRENDATARIO', 'CODEUDOR']
        ).select_related('TRHTipoReporte', 'TCAIDContrato')
        
        if not reportes.exists():
            return {
                'TPNoDocumento': tp_no_documento,
                'cantidad_reportes': 0,
                'puntaje_final': 1000,
                'detalles': 'No hay reportes'
            }
        
        service = RecalculoPuntajeService
        ahora = timezone.now()
        
        reportes_cf = [r for r in reportes if r.TRHTipoReporte.TRHTipoReporte == 'CF']
        reportes_negativos_aplicables = [r for r in reportes if r.TRHTipoReporte.TRHTipoReporte != 'CF']
        reportes_negativos_gracia = []
        
        factores_deuda = [service.get_factor_deuda(r) for r in reportes_negativos_aplicables]
        cantidad_total = len(reportes_negativos_aplicables)
        cantidad_efectiva = sum(factores_deuda)
        cantidad_score = service.get_cantidad_reportes_score(cantidad_efectiva)
        
        tipo_detalles = []
        for r, factor in zip(reportes_negativos_aplicables, factores_deuda):
            peso = service.get_tipo_reporte_weight(r.TRHTipoReporte.TRHTipoReporte)
            tipo_detalles.append({
                'tipo': r.TRHTipoReporte.TRHTipoReporte,
                'peso': peso,
                'factor_deuda': factor,
                'peso_efectivo': peso * factor
            })
        tipo_promedio = sum(d['peso_efectivo'] for d in tipo_detalles) / cantidad_total if cantidad_total > 0 else 50
        
        valor_total = sum(float(r.TRHValorAdeudado or 0) * factor for r, factor in zip(reportes_negativos_aplicables, factores_deuda))
        valor_score = service.get_valor_adeudado_score(valor_total)
        
        recencia_detalles = []
        for r, factor in zip(reportes_negativos_aplicables, factores_deuda):
            score = service.get_recencia_score(r.TRHFechaReporte)
            dias = (ahora - r.TRHFechaReporte).days
            recencia_detalles.append({
                'fecha': r.TRHFechaReporte.isoformat(),
                'dias_atras': dias,
                'score': score,
                'factor_deuda': factor,
                'score_efectivo': score * factor
            })
        recencia_promedio = sum(d['score_efectivo'] for d in recencia_detalles) / cantidad_total if cantidad_total > 0 else 10
        
        cantidad_ponderado = (cantidad_score / 100) * 25
        tipo_ponderado = (tipo_promedio / 100) * 30
        valor_ponderado = (valor_score / 100) * 30
        recencia_ponderado = (recencia_promedio / 100) * 15
        
        penalizacion_base = cantidad_ponderado + tipo_ponderado + valor_ponderado + recencia_ponderado
        
        peso_cf = service.get_tipo_reporte_weight('CF') if reportes_cf else 0
        penalizacion_total = max(0, penalizacion_base + (peso_cf * len(reportes_cf)))
        puntaje_final = max(int(1000 - (penalizacion_total * 10)), 0)
        
        return {
            'TPNoDocumento': tp_no_documento,
            'cantidad_reportes_aplicables': cantidad_reportes,
            'cantidad_reportes_cf': len(reportes_cf),
            'cantidad_reportes_gracia': len(reportes_negativos_gracia),
            'cantidad_score': cantidad_score,
            'cantidad_ponderado': round(cantidad_ponderado, 2),
            'tipo_promedio_peso': round(tipo_promedio, 2),
            'tipo_ponderado': round(tipo_ponderado, 2),
            'tipo_detalles': tipo_detalles,
            'valor_total_adeudado': round(valor_total, 2),
            'valor_score': valor_score,
            'valor_ponderado': round(valor_ponderado, 2),
            'recencia_promedio': round(recencia_promedio, 2),
            'recencia_ponderado': round(recencia_ponderado, 2),
            'recencia_detalles': recencia_detalles,
            'penalizacion_base': round(penalizacion_base, 2),
            'ajuste_cf': peso_cf * len(reportes_cf),
            'penalizacion_total': round(penalizacion_total, 2),
            'puntaje_final': puntaje_final
        }
