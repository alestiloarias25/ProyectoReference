from rest_framework import serializers
from .models import TEmpresas, TCiudades, TPuntajeColor, TTipoReporte


class TEmpresasSerializer(serializers.ModelSerializer):
    class Meta:
        model = TEmpresas
        fields = [
            'TEId', 'TENit', 'TENombre', 'TEDireccion', 'TECelular',
            'TETelefono', 'TEEmail', 'TEContacto', 'TEDescripcion',
            'TEActivo', 'TEFechaCreacion', 'TEFechaActualizacion'
        ]
        read_only_fields = ['TEId', 'TEFechaCreacion', 'TEFechaActualizacion']


class TCiudadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TCiudades
        fields = [
            'TCId', 'TCNombre', 'TCDepartamento', 'TCPais', 'TCDescripcion',
            'TCCodigo', 'TCActivo', 'TCFechaCreacion', 'TCFechaActualizacion'
        ]
        read_only_fields = ['TCId', 'TCFechaCreacion', 'TCFechaActualizacion']


class TPuntajeColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TPuntajeColor
        fields = [
            'TPCNivel', 'TPCValorInicial', 'TPCValorFinal', 'TPCColor',
            'TPCEvaluacion', 'TPCComentario', 'TPCActivo',
            'TPCFechaCreacion', 'TPCFechaActualizacion'
        ]
        read_only_fields = ['TPCFechaCreacion', 'TPCFechaActualizacion']


class TTipoReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TTipoReporte
        fields = [
            'TRHTipoReporte', 'TRDescripcion', 'TRPeso', 'TRActivo',
            'TRFechaCreacion', 'TRFechaActualizacion'
        ]
        read_only_fields = ['TRFechaCreacion', 'TRFechaActualizacion']
from rest_framework import serializers
from .models import TEmpresas, TCiudades, TPuntajeColor, TTipoReporte


class TEmpresasSerializer(serializers.ModelSerializer):
    """Serializador para TEmpresas"""
    class Meta:
        model = TEmpresas
        fields = [
            'TEId', 'TENit', 'TENombre', 'TEDireccion', 'TECelular', 
            'TETelefono', 'TEEmail', 'TEContacto', 'TEDescripcion', 
            'TEActivo', 'TEFechaCreacion', 'TEFechaActualizacion'
        ]
        read_only_fields = ['TEId', 'TEFechaCreacion', 'TEFechaActualizacion']


class TCiudadesSerializer(serializers.ModelSerializer):
    """Serializador para TCiudades"""
    class Meta:
        model = TCiudades
        fields = [
            'TCId', 'TCNombre', 'TCDepartamento', 'TCPais', 'TCDescripcion',
            'TCCodigo', 'TCActivo', 'TCFechaCreacion', 'TCFechaActualizacion'
        ]
        read_only_fields = ['TCId', 'TCFechaCreacion', 'TCFechaActualizacion']


class TPuntajeColorSerializer(serializers.ModelSerializer):
    """Serializador para TPuntajeColor"""
    class Meta:
        model = TPuntajeColor
        fields = [
            'TPCNivel', 'TPCValorInicial', 'TPCValorFinal', 'TPCColor',
            'TPCEvaluacion', 'TPCComentario', 'TPCActivo', 
            'TPCFechaCreacion', 'TPCFechaActualizacion'
        ]
        read_only_fields = ['TPCFechaCreacion', 'TPCFechaActualizacion']


class TTipoReporteSerializer(serializers.ModelSerializer):
    """Serializador para TTipoReporte"""
    class Meta:
        model = TTipoReporte
        fields = [
            'TRHTipoReporte', 'TRDescripcion', 'TRPeso', 'TRActivo',
            'TRFechaCreacion', 'TRFechaActualizacion'
        ]
        read_only_fields = ['TRFechaCreacion', 'TRFechaActualizacion']
