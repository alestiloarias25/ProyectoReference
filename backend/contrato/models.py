from django.db import models


def contrato_pdf_upload_to(instance, filename):
    contrato_id = instance.TCAIDContrato or "nuevo"
    return f"contratos_pdfs/{contrato_id}/{filename}"


class ContratoArriendo(models.Model):
    TCAIDContrato = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150)

    # Campos tomados de TBienesInmuebles
    TBNoMatricula = models.CharField(max_length=50)
    TBDireccion = models.CharField(max_length=150)

    TCAFechaContrato = models.DateField()
    TCAFechaInicioContrato = models.DateField()
    TCAFechaEntregaInmueble = models.DateField(null=True, blank=True)

    TCADuracionContrato = models.IntegerField()
    TCATipoDuracion = models.CharField(
        max_length=2,
        choices=[
            ('DD', 'Días'),
            ('MM', 'Meses'),
            ('AA', 'Años')
        ]
    )

    TCAValorCanonContrato = models.DecimalField(
        max_digits=14,
        decimal_places=2
    )

    TCAFechaReporteContrato = models.DateField(auto_now_add=True)
    TCAArchivoPDF = models.FileField(
        upload_to=contrato_pdf_upload_to,
        max_length=255,
        null=True,
        blank=True
    )

    class Meta:
        db_table = "tcontratoarriendo"


class ContratoArriendoRelacion(models.Model):
    TCAIDContrato = models.ForeignKey(
        ContratoArriendo,
        on_delete=models.CASCADE,
        db_column='TCAIDContrato',
        related_name='personas'
    )

    TPNoDocumento = models.CharField(max_length=50)

    TCARTipoParticipacion = models.CharField(
        max_length=20,
        choices=[
            ('ARRENDADOR', 'Arrendador'),
            ('ARRENDATARIO', 'Arrendatario'),
            ('CODEUDOR', 'Codeudor'),
        ]
    )

    class Meta:
        db_table = "tcontratoarriendorelacion"
        unique_together = ('TCAIDContrato', 'TPNoDocumento')


