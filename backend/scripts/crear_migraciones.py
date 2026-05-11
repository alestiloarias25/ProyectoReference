"""
Script para crear las migraciones necesarias para los nuevos modelos TEmpresas y TCiudades,
y actualizar las relaciones en Persona.

IMPORTANTE: Ejecutar en el orden siguiente:

1. Crear las migraciones:
   python manage.py makemigrations referencias
   python manage.py makemigrations personas

2. Revisar las migraciones generadas en:
   - backend/referencias/migrations/000X_add_tempresas_tciudades.py
   - backend/personas/migrations/000X_alter_persona_fields.py

3. Aplicar las migraciones:
   python manage.py migrate referencias
   python manage.py migrate personas

4. Crear datos iniciales (opcional):
   python manage.py shell < poblar_empresas_ciudades.py

CAMBIOS REALIZADOS:
- Añadidos modelos TEmpresas y TCiudades en referencias/models.py
- Actualizado modelo Persona para usar ForeignKey a TEmpresas y TCiudades
- Creados ViewSets para TEmpresasViewSet y TCiudadesViewSet
- Registrados endpoints /api/empresas/ y /api/ciudades/
- Actualizado PasoPersonas.js para usar dropdowns con opción de crear registros
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

print("=" * 80)
print("SISTEMA DE MIGRACIONES - TEmpresas y TCiudades")
print("=" * 80)
print("\n✅ Django configurado correctamente\n")
print("Instrucciones a ejecutar en terminal:\n")
print("1. python manage.py makemigrations referencias")
print("2. python manage.py makemigrations personas")
print("3. python manage.py migrate referencias")
print("4. python manage.py migrate personas")
print("\n" + "=" * 80)
