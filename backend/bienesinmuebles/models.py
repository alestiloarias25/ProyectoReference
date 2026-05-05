from django.db import models

class TbienesInmuebles(models.Model):
    TBNoMatricula = models.CharField(max_length=50)
    TBDireccion = models.CharField(max_length=150)
    TCId = models.CharField(max_length=10)
    TBTipo = models.CharField(max_length=20)
    TBObs = models.CharField(max_length=255, blank=True, null=True)
    username = models.CharField(max_length=150)
    
    # Nuevos campos
    numero_contrato_energia = models.CharField(max_length=50, blank=True, null=True)
    numero_contrato_agua = models.CharField(max_length=50, blank=True, null=True)
    numero_contrato_gas = models.CharField(max_length=50, blank=True, null=True)
    certificado_tradicion = models.FileField(upload_to='certificados/', null=True, blank=True)

    class Meta:
        db_table = "tbienesinmuebles"
        constraints = [
            models.UniqueConstraint(
                fields=['TBNoMatricula', 'TBDireccion'],
                name='uq_tbienes_matricula_direccion'
            )
        ]

class FotoInmueble(models.Model):
    inmueble = models.ForeignKey(TbienesInmuebles, on_delete=models.CASCADE, related_name='fotos')
    imagen = models.ImageField(upload_to='inmuebles/')
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tfotosinmueble"
