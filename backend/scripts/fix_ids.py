import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()
from tablas_maestras.models import TEmpresas, TCiudades
from personas.models import Persona
from django.db import connection

# Fix TEmpresas
cursor = connection.cursor()
# Get the records with NULL TEId
empresas_null = TEmpresas.objects.filter(TEId__isnull=True).order_by('TEDescripcion')
ids_to_assign = [2, 3, 4]  # Based on the foreign keys
for emp, new_id in zip(empresas_null, ids_to_assign):
    TEmpresas.objects.filter(pk=emp.pk).update(TEId=new_id)
    print(f"Updated Empresa {emp.TEDescripcion} to TEId {new_id}")

# Fix TCiudades
ciudades_null = TCiudades.objects.filter(TCId__isnull=True).order_by('TCNombre')
ids_to_assign = [3, 4, 5]  # Based on the foreign keys
for ciu, new_id in zip(ciudades_null, ids_to_assign):
    TCiudades.objects.filter(pk=ciu.pk).update(TCId=new_id)
    print(f"Updated Ciudad {ciu.TCNombre} to TCId {new_id}")

print("Done fixing IDs")