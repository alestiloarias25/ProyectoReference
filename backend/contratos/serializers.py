from rest_framework import serializers
from .models import TbienesInmuebles

class TbienesInmueblesSerializer(serializers.ModelSerializer):
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
        ]       
        read_only_fields = ["username"]
         
