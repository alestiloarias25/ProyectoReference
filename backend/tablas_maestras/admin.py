from django.contrib import admin
from .models import TEmpresas, TCiudades, TPuntajeColor, TTipoReporte


@admin.register(TEmpresas)
class TEmpresasAdmin(admin.ModelAdmin):
    list_display = ['TEId', 'TEDescripcion', 'TENombre', 'TEEmail', 'TEActivo', 'TEFechaCreacion']
    list_filter = ['TEActivo', 'TEFechaCreacion']
    search_fields = ['TEDescripcion', 'TENombre', 'TENit', 'TEEmail']
    readonly_fields = ['TEId', 'TEFechaCreacion', 'TEFechaActualizacion']
    fieldsets = (
        ('Información Básica', {
            'fields': ('TEId', 'TEDescripcion', 'TENombre', 'TENit')
        }),
        ('Contacto', {
            'fields': ('TEEmail', 'TEContacto', 'TETelefono', 'TECelular')
        }),
        ('Ubicación', {
            'fields': ('TEDireccion',)
        }),
        ('Estado', {
            'fields': ('TEActivo', 'TEFechaCreacion', 'TEFechaActualizacion')
        }),
    )


@admin.register(TCiudades)
class TCiudadesAdmin(admin.ModelAdmin):
    list_display = ['TCId', 'TCDescripcion', 'TCNombre', 'TCDepartamento', 'TCPais', 'TCActivo', 'TCFechaCreacion']
    list_filter = ['TCActivo', 'TCPais', 'TCDepartamento', 'TCFechaCreacion']
    search_fields = ['TCDescripcion', 'TCNombre', 'TCCodigo', 'TCDepartamento']
    readonly_fields = ['TCId', 'TCFechaCreacion', 'TCFechaActualizacion']
    fieldsets = (
        ('Información Básica', {
            'fields': ('TCId', 'TCDescripcion', 'TCNombre', 'TCCodigo')
        }),
        ('Ubicación Geográfica', {
            'fields': ('TCDepartamento', 'TCPais')
        }),
        ('Estado', {
            'fields': ('TCActivo', 'TCFechaCreacion', 'TCFechaActualizacion')
        }),
    )


@admin.register(TPuntajeColor)
class TPuntajeColorAdmin(admin.ModelAdmin):
    list_display = ['TPCNivel', 'TPCValorInicial', 'TPCValorFinal', 'TPCColor', 'TPCEvaluacion', 'TPCActivo']
    list_filter = ['TPCActivo', 'TPCFechaCreacion']
    search_fields = ['TPCNivel', 'TPCEvaluacion']
    readonly_fields = ['TPCFechaCreacion', 'TPCFechaActualizacion']
    fieldsets = (
        ('Configuración del Nivel', {
            'fields': ('TPCNivel', 'TPCValorInicial', 'TPCValorFinal')
        }),
        ('Visualización', {
            'fields': ('TPCColor', 'TPCEvaluacion')
        }),
        ('Descripción', {
            'fields': ('TPCComentario',)
        }),
        ('Estado', {
            'fields': ('TPCActivo', 'TPCFechaCreacion', 'TPCFechaActualizacion')
        }),
    )


@admin.register(TTipoReporte)
class TTipoReporteAdmin(admin.ModelAdmin):
    list_display = ['TRHTipoReporte', 'TRDescripcion', 'TRPeso', 'TRActivo', 'TRFechaCreacion']
    list_filter = ['TRActivo', 'TRFechaCreacion']
    search_fields = ['TRHTipoReporte', 'TRDescripcion']
    readonly_fields = ['TRFechaCreacion', 'TRFechaActualizacion']
    fieldsets = (
        ('Información Básica', {
            'fields': ('TRHTipoReporte', 'TRDescripcion')
        }),
        ('Prioridad', {
            'fields': ('TRPeso',)
        }),
        ('Estado', {
            'fields': ('TRActivo', 'TRFechaCreacion', 'TRFechaActualizacion')
        }),
    )
