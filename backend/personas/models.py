from django.db import models
from tablas_maestras.models import TEmpresas, TCiudades


class Persona(models.Model):
    TIPO_DOCUMENTO_CHOICES = [
        ('CC', 'Cédula de Ciudadanía'),
        ('CE', 'Cédula de Extranjería'),
        ('NT', 'NIT'),
        ('PA', 'Pasaporte'),
        ('PR', 'Permiso Temporal de Residencia'),
    ]
    
    TPTipoDocumento = models.CharField(max_length=10, choices=TIPO_DOCUMENTO_CHOICES)
    TPNoDocumento = models.CharField(max_length=50, primary_key=True)
    TPNombres = models.CharField(max_length=100)
    TPApellidos = models.CharField(max_length=100)
    TPDireccionResidencia = models.CharField(max_length=200)
    TPCelular1 = models.CharField(max_length=20)
    TPCelular2 = models.CharField(max_length=20, blank=True, null=True)
    TEId = models.ForeignKey(TEmpresas, on_delete=models.PROTECT, db_column='TEId')
    TCId = models.ForeignKey(TCiudades, on_delete=models.PROTECT, db_column='TCId')
    TPBarriosZona = models.CharField(max_length=100, blank=True, null=True)
    TPPuntaje = models.IntegerField(default=1000)

    class Meta:
        db_table = "tpersonas"   # 🔥 MUY IMPORTANTE
        managed = True           # ahora manejado para que migraciones afecten al esquema

    def save(self, *args, **kwargs):
        # Llenar puntaje automáticamente en la primera creación
        if self._state.adding and (self.TPPuntaje is None or self.TPPuntaje == 0):
            # default inicial 1000 al crear persona
            self.TPPuntaje = 1000
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.TPNombres} {self.TPApellidos}"





