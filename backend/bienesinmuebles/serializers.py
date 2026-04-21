from rest_framework import serializers
from .models import TbienesInmuebles, FotoInmueble
from django.contrib.auth.models import User
import re

class FotoInmuebleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoInmueble
        fields = ['id', 'imagen', 'fecha_subida']

class TbienesInmueblesSerializer(serializers.ModelSerializer):
    fotos = FotoInmuebleSerializer(many=True, read_only=True)
    telefono_contacto = serializers.SerializerMethodField()

    class Meta:
        model = TbienesInmuebles
        fields = [
            "id",
            "TBNoMatricula",
            "TBDireccion",
            "TCId",
            "TBTipo",
            "TBObs",
            "username",
            "fotos",
            "telefono_contacto"
        ]       
        read_only_fields = ["username", "fotos"]

    def validate_TBDireccion(self, value):
        # Format: V NNNLN NNNL NNN CCCCCCC
        # Regex: ^[a-zA-Z]+\s[0-9a-zA-Z]+\s[0-9a-zA-Z]+\s\d+(?:\s.+)?$
        if not re.match(r'^[a-zA-Z]+\s[0-9a-zA-Z]+\s[0-9a-zA-Z]+\s\d+(?:\s.+)?$', value):
            raise serializers.ValidationError("Debe usar el formato: Vía Número Letra Número Letra Número Complemento. Ej: C 60 18 15 o K 21B 35 28 Ap 201")
        return value

    def get_telefono_contacto(self, obj):
        try:
            user = User.objects.get(username=obj.username)
            return user.profile.celular
        except:
            return None
