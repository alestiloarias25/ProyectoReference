from django.db import models


class TEmpresas(models.Model):
    """Tabla de empresas - Tabla maestra"""
    TEId = models.AutoField(primary_key=True)
    TENit = models.CharField(max_length=20, blank=True, null=True, help_text="NIT de la empresa")
    TENombre = models.CharField(max_length=200, blank=True, null=True, help_text="Nombre de la empresa")
    TEDireccion = models.CharField(max_length=300, blank=True, null=True, help_text="Dirección de la empresa")
    TECelular = models.CharField(max_length=20, blank=True, null=True, help_text="Celular de contacto")
    TETelefono = models.CharField(max_length=20, blank=True, null=True, help_text="Teléfono fijo")
    TEEmail = models.EmailField(blank=True, null=True, help_text="Email de la empresa")
    TEContacto = models.CharField(max_length=100, blank=True, null=True, help_text="Nombre del contacto")
    TEDescripcion = models.CharField(max_length=200, help_text="Descripción de la empresa")
    TEActivo = models.BooleanField(default=True, help_text="Indica si la empresa está activa")
    TEFechaCreacion = models.DateTimeField(auto_now_add=True)
    TEFechaActualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "tempresas"
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ['TEId']
    
    def __str__(self):
        return f"{self.TEId} - {self.TEDescripcion}"


class TCiudades(models.Model):
    """Tabla de ciudades - Tabla maestra"""
    TCId = models.AutoField(primary_key=True)
    TCNombre = models.CharField(max_length=100, blank=True, null=True, help_text="Nombre de la ciudad")
    TCDepartamento = models.CharField(max_length=100, blank=True, null=True, help_text="Departamento/Provincia")
    TCPais = models.CharField(max_length=100, blank=True, null=True, help_text="País")
    TCDescripcion = models.CharField(max_length=100, help_text="Descripción corta de la ciudad")
    TCCodigo = models.CharField(max_length=10, blank=True, null=True, unique=True, help_text="Código único de la ciudad")
    TCActivo = models.BooleanField(default=True, help_text="Indica si la ciudad está activa")
    TCFechaCreacion = models.DateTimeField(auto_now_add=True)
    TCFechaActualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "tciudades"
        verbose_name = "Ciudad"
        verbose_name_plural = "Ciudades"
        ordering = ['TCId']
    
    def __str__(self):
        return f"{self.TCId} - {self.TCDescripcion}"


class TPuntajeColor(models.Model):
    """Tabla de configuración de colores para rangos de puntaje - Tabla maestra"""
    TPCNivel = models.CharField(max_length=50, primary_key=True, help_text="Nivel de puntaje")
    TPCValorInicial = models.IntegerField(help_text="Valor inicial del rango de puntaje")
    TPCValorFinal = models.IntegerField(help_text="Valor final del rango de puntaje")
    TPCColor = models.CharField(max_length=50, help_text="Código de color (ej: #FF0000) o nombre del color")
    TPCEvaluacion = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Evaluación asociada al nivel de puntaje"
    )
    TPCComentario = models.TextField(
        blank=True,
        null=True,
        help_text="Comentario o descripción detallada del nivel"
    )
    TPCActivo = models.BooleanField(default=True, help_text="Indica si la configuración está activa")
    TPCFechaCreacion = models.DateTimeField(auto_now_add=True)
    TPCFechaActualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tpuntajecolor"
        verbose_name = "Configuración de Color de Puntaje"
        verbose_name_plural = "Configuraciones de Color de Puntaje"
        ordering = ['TPCValorInicial']

    def __str__(self):
        return f"{self.TPCNivel} ({self.TPCValorInicial}-{self.TPCValorFinal}) - {self.TPCColor}"


class TTipoReporte(models.Model):
    """Tabla de tipos de reporte para novedades de contratos - Tabla maestra"""
    TRHTipoReporte = models.CharField(max_length=100, primary_key=True, help_text="Código del tipo de reporte")
    TRDescripcion = models.TextField(blank=True, null=True, help_text="Descripción del tipo de reporte")
    TRPeso = models.IntegerField(null=True, blank=True, help_text="Peso o prioridad del reporte")
    TRActivo = models.BooleanField(default=True, help_text="Indica si el tipo de reporte está activo")
    TRFechaCreacion = models.DateTimeField(auto_now_add=True)
    TRFechaActualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ttiporeporte"
        verbose_name = "Tipo de Reporte"
        verbose_name_plural = "Tipos de Reporte"
        ordering = ['TRHTipoReporte']

    def __str__(self):
        return self.TRHTipoReporte
