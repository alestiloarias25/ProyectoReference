from django.db import models
from django.contrib.auth.models import User
from contrato.models import ContratoArriendo
from tablas_maestras.models import TTipoReporte


class THistorial(models.Model):
    """Tabla de historial de reportes/novedades de contratos de arrendamiento"""
    TRHId = models.AutoField(primary_key=True)

    TCAIDContrato = models.ForeignKey(
        ContratoArriendo,
        on_delete=models.CASCADE,
        db_column='TCAIDContrato',
        related_name='reportes'
    )

    TRHTipoReporte = models.ForeignKey(
        TTipoReporte,
        on_delete=models.PROTECT,
        db_column='TRHTipoReporte',
        related_name='historial_reportes'
    )

    TRHValorAdeudado = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True
    )

    TRHValorPagado = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        null=False,
        blank=False
    )

    TRHSaldo = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
        null=False,
        blank=False
    )

    TRHEstado = models.CharField(
        max_length=50,
        default='ABIERTO'
    )

    TRHFechaPago = models.DateField(
        null=True,
        blank=True
    )

    TRHObservacion = models.TextField(blank=True, null=True)

    TRHFechaReporte = models.DateTimeField(auto_now_add=True)

    TUUserName = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        db_table = "thistorial"
        unique_together = ('TCAIDContrato', 'TRHTipoReporte')

    def __str__(self):
        return f"Reporte {self.TRHId} - Contrato {self.TCAIDContrato_id}"
