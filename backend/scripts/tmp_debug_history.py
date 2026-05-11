import os
import sys
sys.path.insert(0, '.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()
from contrato.models import ContratoArriendoRelacion
from referencias.models import THistorial

print('ContratoArriendoRelacion count:', ContratoArriendoRelacion.objects.count())
print('THistorial count:', THistorial.objects.count())
print('First 10 ContratoArriendoRelacion:')
for rel in ContratoArriendoRelacion.objects.all()[:10]:
    print(rel.TCAIDContrato_id, '|', rel.TPNoDocumento, '|', rel.TCARTipoParticipacion)
print('First 10 THistorial:')
for rep in THistorial.objects.all()[:10]:
    print(rep.TRHId, '|', rep.TCAIDContrato_id, '|', rep.TRHTipoReporte_id, '|', rep.TRHValorAdeudado, '|', rep.TRHFechaReporte)
