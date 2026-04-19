from rest_framework import serializers
from django.db import transaction
import json
from .models import ContratoArriendo, ContratoArriendoRelacion
from bienesinmuebles.models import TbienesInmuebles
from usuarios.permissions import get_user_role, ROLE_ADMINISTRADOR


class ContratoPersonaSerializer(serializers.ModelSerializer):
    TPTipoDocumento = serializers.CharField(write_only=True)

    class Meta:
        model = ContratoArriendoRelacion
        fields = [
            'TPTipoDocumento',
            'TPNoDocumento',
            'TCARTipoParticipacion'
        ]


class ContratoArriendoSerializer(serializers.ModelSerializer):
    personas = ContratoPersonaSerializer(many=True, required=False)
    bien_inmueble_id = serializers.IntegerField(write_only=True)
    TCAArchivoPDF = serializers.FileField(required=True, allow_null=False)

    class Meta:
        model = ContratoArriendo
        fields = [
            'TCAIDContrato',
            'username',
            'bien_inmueble_id',
            'TCAFechaContrato',
            'TCAFechaInicioContrato',
            'TCAFechaEntregaInmueble',
            'TCADuracionContrato',
            'TCATipoDuracion',
            'TCAValorCanonContrato',
            'TCAArchivoPDF',
            'TBDireccion',
            'personas'
        ]
        read_only_fields = ['username', 'TBDireccion']

    def _parse_personas_from_initial_data(self):
        raw_personas = self.initial_data.get("personas")

        if raw_personas in (None, "", []):
            raise serializers.ValidationError({
                "personas": "Este campo es requerido."
            })

        if isinstance(raw_personas, str):
            try:
                raw_personas = json.loads(raw_personas)
            except json.JSONDecodeError:
                raise serializers.ValidationError({
                    "personas": "El formato de personas no es valido."
                })

        personas_serializer = ContratoPersonaSerializer(data=raw_personas, many=True)
        personas_serializer.is_valid(raise_exception=True)
        return personas_serializer.validated_data

    def validate(self, data):
        if not data.get("personas"):
            data["personas"] = self._parse_personas_from_initial_data()

        from personas.models import Persona
        for p in data["personas"]:
            tipo_doc = p.get('TPTipoDocumento')
            no_doc = p.get('TPNoDocumento')
            if not Persona.objects.filter(TPTipoDocumento=tipo_doc, TPNoDocumento=no_doc).exists():
                raise serializers.ValidationError(f"La persona con documento {tipo_doc} {no_doc} no está registrada.")

        if data['TCAFechaInicioContrato'] < data['TCAFechaContrato']:
            raise serializers.ValidationError("La fecha de inicio no puede ser anterior a la fecha del contrato.")

        bien_id = data.get('bien_inmueble_id')
        if bien_id:
            try:
                bien = TbienesInmuebles.objects.get(id=bien_id)
            except TbienesInmuebles.DoesNotExist:
                raise serializers.ValidationError({"bien_inmueble_id": "El bien inmueble no existe."})

            contrato_activo = ContratoArriendo.objects.filter(
                TBNoMatricula=bien.TBNoMatricula,
                TBDireccion=bien.TBDireccion,
                TCAFechaEntregaInmueble__isnull=True
            ).exists()

            if contrato_activo:
                raise serializers.ValidationError("No se puede crear el contrato porque el inmueble tiene un contrato activo sin Fecha de Entrega.")

        return data

    def validate_TCAArchivoPDF(self, value):
        if value is None:
            return value

        content_type = getattr(value, "content_type", "")
        filename = getattr(value, "name", "")

        if content_type and content_type != "application/pdf" and not filename.lower().endswith(".pdf"):
            raise serializers.ValidationError("El archivo debe ser un PDF.")

        if not content_type and not filename.lower().endswith(".pdf"):
            raise serializers.ValidationError("El archivo debe ser un PDF.")

        return value

    def create(self, validated_data):
        personas_data = validated_data.pop('personas')
        bien_id = validated_data.pop('bien_inmueble_id')
        request = self.context.get('request')
        username = getattr(getattr(request, 'user', None), 'username', '') or 'earias'

        with transaction.atomic():
            # Obtener el bien inmueble
            bien = TbienesInmuebles.objects.get(id=bien_id)
            if request and get_user_role(request.user) != ROLE_ADMINISTRADOR and bien.username != username:
                raise serializers.ValidationError({
                    "bien_inmueble_id": "No tienes permiso para usar este bien inmueble."
                })

            # Crear contrato
            contrato = ContratoArriendo.objects.create(
                username=username,
                TBNoMatricula=bien.TBNoMatricula,
                TBDireccion=bien.TBDireccion,
                **validated_data
            )

            # Crear relaciones con personas
            for persona in personas_data:
                persona.pop('TPTipoDocumento', None)
                ContratoArriendoRelacion.objects.create(
                    TCAIDContrato=contrato,
                    **persona
                )

        return contrato
