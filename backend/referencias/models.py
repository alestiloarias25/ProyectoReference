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

    TRHEstado = models.CharField(
        max_length=50,
        default='ABIERTO'
    )

    TRHObservacion = models.TextField(blank=True, null=True)

    TRHFechaReporte = models.DateTimeField(auto_now_add=True)

    TUUserName = models.CharField(max_length=150, blank=True, null=True)

    class Meta:
        db_table = "thistorial"
        unique_together = ('TCAIDContrato', 'TRHTipoReporte')

    def __str__(self):
        return f"Reporte {self.TRHId} - Contrato {self.TCAIDContrato_id}"

class TAlertas(models.Model):
    TAId = models.AutoField(primary_key=True)
    TUUserName = models.CharField(max_length=150)
    TCAIDContrato = models.ForeignKey(
        ContratoArriendo,
        on_delete=models.CASCADE,
        db_column='TCAIDContrato',
        related_name='alertas',
        null=True,
        blank=True
    )
    
    # Campos del Reporte replicados
    TATipoReporte = models.ForeignKey(
        TTipoReporte,
        on_delete=models.PROTECT,
        db_column='TATipoReporte',
        null=True,
        blank=True
    )
    TAValorAdeudado = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    TAValorPagado = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    TASaldo = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    TAEstado = models.CharField(max_length=50, default='ABIERTO', null=True, blank=True)
    TAFechaPago = models.DateField(null=True, blank=True)
    TAObservacion = models.TextField(blank=True, null=True)
    TAFechaReporte = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "talertas"

    def __str__(self):
        return f"Alerta {self.TAId} - Usuario {self.TUUserName}"

class ThistorialPagos(models.Model):
    THPId = models.AutoField(primary_key=True)
    TRHId = models.ForeignKey(THistorial, on_delete=models.CASCADE, db_column='TRHId', related_name='pagos')
    TCAIDContrato = models.ForeignKey(ContratoArriendo, on_delete=models.CASCADE, db_column='TCAIDContrato')
    TRHFechaPago = models.DateField()
    TRHValorPagado = models.DecimalField(max_digits=14, decimal_places=2)
    TRHPobservacion = models.TextField(blank=True, null=True)
    TUUserName = models.CharField(max_length=150)

    class Meta:
        db_table = "thistorialpagos"

    def __str__(self):
        return f"Pago {self.THPId} - Reporte {self.TRHId_id}"
