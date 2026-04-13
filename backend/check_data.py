import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()
from tablas_maestras.models import TEmpresas, TCiudades

print('Empresas:')
for e in TEmpresas.objects.all():
    print(f'ID: {e.TEId}, Desc: "{e.TEDescripcion}"')

print('Ciudades:')
for c in TCiudades.objects.all():
    print(f'ID: {c.TCId}, Desc: "{c.TCDescripcion}"')