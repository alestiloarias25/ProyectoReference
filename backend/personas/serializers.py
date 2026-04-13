from rest_framework import serializers
from .models import Persona
from tablas_maestras.models import TEmpresas, TCiudades


class TEmpresasSerializer(serializers.ModelSerializer):
    TEDescripcion = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        descripcion = (attrs.get("TEDescripcion") or "").strip()
        nombre = (attrs.get("TENombre") or "").strip()

        if not descripcion and nombre:
            attrs["TEDescripcion"] = nombre
            descripcion = nombre

        if not descripcion:
            raise serializers.ValidationError({
                "TEDescripcion": "La descripcion es requerida o debe ingresar un nombre para generarla automaticamente."
            })

        return attrs

    class Meta:
        model = TEmpresas
        fields = "__all__"
        read_only_fields = ("TEId",)


class TCiudadesSerializer(serializers.ModelSerializer):
    TCDescripcion = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        descripcion = (attrs.get("TCDescripcion") or "").strip()
        nombre = (attrs.get("TCNombre") or "").strip()

        if not descripcion and nombre:
            attrs["TCDescripcion"] = nombre
            descripcion = nombre

        if not descripcion:
            raise serializers.ValidationError({
                "TCDescripcion": "La descripcion es requerida o debe ingresar un nombre para generarla automaticamente."
            })

        return attrs

    class Meta:
        model = TCiudades
        fields = "__all__"
        read_only_fields = ("TCId",)


class PersonaSerializer(serializers.ModelSerializer):
    TEId = TEmpresasSerializer(read_only=True)
    TCId = TCiudadesSerializer(read_only=True)
    TEId_id = serializers.PrimaryKeyRelatedField(
        queryset=TEmpresas.objects.all(),
        source='TEId',
        write_only=True,
        required=True
    )
    TCId_id = serializers.PrimaryKeyRelatedField(
        queryset=TCiudades.objects.all(),
        source='TCId',
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Persona
        fields = "__all__"

