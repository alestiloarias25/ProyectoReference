from django.db import models

class TbienesInmuebles(models.Model):
    TBNoMatricula = models.CharField(max_length=50)
    TBDireccion = models.CharField(max_length=150)
    TCId = models.CharField(max_length=10)
    TBTipo = models.CharField(max_length=20)
    TBObs = models.CharField(max_length=255, blank=True, null=True)
    username = models.CharField(max_length=150)

    class Meta:
        db_table = "tbienesinmuebles"
        constraints = [
            models.UniqueConstraint(
                fields=['TBNoMatricula', 'TBDireccion'],
                name='uq_tbienes_matricula_direccion'
            )
        ]
    
    
    
