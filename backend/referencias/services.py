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
        """
        if cantidad == 0:
            return 0
        elif cantidad == 1:
            return 20
        elif cantidad == 2:
            return 40
        elif cantidad == 3:
            return 60
        elif cantidad == 4:
            return 80
        else:  # 5 o más
            return 100

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
        (<3 meses)=100, (3 a 6 meses)=80, (6 a 12 meses)=60,
        (12 a 24 meses)=30, (24+ meses)=10
        """
        if not fecha_reporte:
            return 10
        
        ahora = timezone.now()
        dias_transcurridos = (ahora - fecha_reporte).days
        
        if dias_transcurridos < 90:  # < 3 meses
            return 100
        elif dias_transcurridos < 180:  # 3 a 6 meses
            return 80
        elif dias_transcurridos < 365:  # 6 a 12 meses
            return 60
        elif dias_transcurridos < 730:  # 12 a 24 meses
            return 30
        else:  # 24+ meses
            return 10

    @staticmethod
    def obtener_reportes_arrendatario(tp_no_documento):
        """
        Obtiene todos los reportes asociados a un arrendatario
        """
        return THistorial.objects.filter(
            TCAIDContrato__personas__TPNoDocumento=tp_no_documento,
            TCAIDContrato__personas__TCARTipoParticipacion__in=['ARRENDATARIO', 'CODEUDOR']
        ).select_related('TRHTipoReporte', 'TCAIDContrato')

    @classmethod
    def calcular_penalizacion_total(cls, tp_no_documento):
        """
        Calcula la penalización total según la fórmula:
        PenalizaciónTotal = (CantidadReportes * 25%) + (TipoReporte * 30%) + 
                           (ValorAdeudado * 30%) + (Recencia * 15%)
        """
        reportes = cls.obtener_reportes_arrendatario(tp_no_documento)
        
        if not reportes.exists():
            return 0
        
        # 1. Cantidad de reportes
        cantidad_reportes = reportes.count()
        cantidad_score = cls.get_cantidad_reportes_score(cantidad_reportes)
        cantidad_ponderado = (cantidad_score / 100) * 25  # 25%
        
        # 2. Tipo de reporte (promedio de pesos)
        tipo_scores = []
        for reporte in reportes:
            peso = cls.get_tipo_reporte_weight(reporte.TRHTipoReporte.TRHTipoReporte)
            tipo_scores.append(peso)
        
        tipo_promedio = sum(tipo_scores) / len(tipo_scores) if tipo_scores else 50
        tipo_ponderado = (tipo_promedio / 100) * 30  # 30%
        
        # 3. Valor adeudado total
        valor_total = sum(
            float(r.TRHValorAdeudado or 0) for r in reportes
        )
        valor_score = cls.get_valor_adeudado_score(valor_total)
        valor_ponderado = (valor_score / 100) * 30  # 30%
        
        # 4. Recencia (promedio)
        recencia_scores = []
        for reporte in reportes:
            score = cls.get_recencia_score(reporte.TRHFechaReporte)
            recencia_scores.append(score)
        
        recencia_promedio = sum(recencia_scores) / len(recencia_scores) if recencia_scores else 10
        recencia_ponderado = (recencia_promedio / 100) * 15  # 15%
        
        # Total
        penalizacion_total = cantidad_ponderado + tipo_ponderado + valor_ponderado + recencia_ponderado
        
        return penalizacion_total

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
        
        # Cantidad de reportes
        cantidad_reportes = reportes.count()
        cantidad_score = service.get_cantidad_reportes_score(cantidad_reportes)
        
        # Tipo de reporte
        tipo_detalles = []
        for reporte in reportes:
            peso = service.get_tipo_reporte_weight(reporte.TRHTipoReporte.TRHTipoReporte)
            tipo_detalles.append({
                'tipo': reporte.TRHTipoReporte.TRHTipoReporte,
                'peso': peso
            })
        tipo_promedio = sum(d['peso'] for d in tipo_detalles) / len(tipo_detalles) if tipo_detalles else 50
        
        # Valor adeudado
        valor_total = sum(float(r.TRHValorAdeudado or 0) for r in reportes)
        valor_score = service.get_valor_adeudado_score(valor_total)
        
        # Recencia
        recencia_detalles = []
        for reporte in reportes:
            score = service.get_recencia_score(reporte.TRHFechaReporte)
            dias = (timezone.now() - reporte.TRHFechaReporte).days
            recencia_detalles.append({
                'fecha': reporte.TRHFechaReporte.isoformat(),
                'dias_atras': dias,
                'score': score
            })
        recencia_promedio = sum(d['score'] for d in recencia_detalles) / len(recencia_detalles) if recencia_detalles else 10
        
        # Cálculos finales
        cantidad_ponderado = (cantidad_score / 100) * 25
        tipo_ponderado = (tipo_promedio / 100) * 30
        valor_ponderado = (valor_score / 100) * 30
        recencia_ponderado = (recencia_promedio / 100) * 15
        
        penalizacion_total = cantidad_ponderado + tipo_ponderado + valor_ponderado + recencia_ponderado
        puntaje_final = max(int(1000 - (penalizacion_total * 10)), 0)
        
        return {
            'TPNoDocumento': tp_no_documento,
            'cantidad_reportes': cantidad_reportes,
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
            'penalizacion_total': round(penalizacion_total, 2),
            'puntaje_final': puntaje_final
        }
