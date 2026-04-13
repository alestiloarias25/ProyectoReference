#!/usr/bin/env python
import os
import sys
import django

# Cambiar a directorio backend
os.chdir('c:\\Users\\EDGAR\\Desktop\\ProyectoReference\\backend')

# Configurar Django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()

from tablas_maestras.models import TEmpresas, TCiudades

# Crear empresas
empresas_data = [
    {'TEDescripcion': 'Constructora ABC', 'TEContacto': 'Juan Pérez', 'TEFono': '+57 1 2345678', 'TEEmail': 'contacto@constructora.com'},
    {'TEDescripcion': 'Inmobiliaria XYZ', 'TEContacto': 'María García', 'TEFono': '+57 1 9876543', 'TEEmail': 'info@inmobiliaria.com'},
]

ciudades_data = [
    {'TCDescripcion': 'Bogotá', 'TCDepartamento': 'Cundinamarca'},
    {'TCDescripcion': 'Medellín', 'TCDepartamento': 'Antioquia'},
    {'TCDescripcion': 'Cali', 'TCDepartamento': 'Valle del Cauca'},
]

print("Creando empresas...")
for emp in empresas_data:
    try:
        TEmpresas.objects.get_or_create(**emp)
        print(f"✅ {emp['TEDescripcion']}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\nCreando ciudades...")
for ciu in ciudades_data:
    try:
        TCiudades.objects.get_or_create(**ciu)
        print(f"✅ {ciu['TCDescripcion']}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n✅ Población completada")
