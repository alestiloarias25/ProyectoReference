import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from personas.models import Persona
from bienesinmuebles.models import TbienesInmuebles
from contrato.models import ContratoArriendo
from tablas_maestras.models import TEmpresas, TCiudades

print("--- INICIANDO VERIFICACIÓN DE CAMBIOS ---")

# 1. Verificar Renombrado de App
print("\n[1] Verificando Renombrado a bienesinmuebles...")
try:
    from bienesinmuebles.models import TbienesInmuebles
    print("✅ App bienesinmuebles cargada correctamente.")
except ImportError as e:
    print(f"❌ Error cargando bienesinmuebles: {e}")

# 2. Verificar Creación de Usuario
print("\n[2] Verificando creación de Usuario con No Documento...")
user_doc = "1020304050"
if not User.objects.filter(username=user_doc).exists():
    user = User.objects.create_user(username=user_doc, email="test@test.com", password="password123")
    print(f"✅ Usuario creado con No Documento como username: {user.username}")
else:
    print(f"✅ Usuario con No Documento {user_doc} ya existe en DB.")

# Preparar datos base para Contrato
try:
    empresa, _ = TEmpresas.objects.get_or_create(TEDescripcion="Empresa Test", defaults={'TEActivo': True})
    ciudad, _ = TCiudades.objects.get_or_create(TCDescripcion="Ciudad Test", defaults={'TCActivo': True})
    
    persona, _ = Persona.objects.get_or_create(
        TPNoDocumento=user_doc, 
        defaults={
            'TPTipoDocumento': 'CC', 
            'TPNombres': 'Juan', 
            'TPApellidos': 'Perez',
            'TPDireccionResidencia': 'Calle 123',
            'TPCelular1': '3001234567',
            'TEId': empresa,
            'TCId': ciudad,
            'TPPuntaje': 1000
        }
    )

    inmueble, _ = TbienesInmuebles.objects.get_or_create(
        TBNoMatricula="MAT-999",
        TBDireccion="Avenida 456",
        defaults={'username': user_doc, 'TCId': '1', 'TBTipo': 'APARTAMENTO'}
    )
    print("✅ Datos base (Persona e Inmueble) listos.")
except Exception as e:
    print(f"⚠️ Error creando datos base: {e}")

print("\n--- VERIFICACIÓN COMPLETADA ---")
print("Para probar la lógica de las APIs en vivo, asegúrate de levantar tu servidor: python manage.py runserver")
