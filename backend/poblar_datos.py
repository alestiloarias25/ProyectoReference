#!/usr/bin/env python
"""
Script para poblar datos iniciales en las tablas TTipoReporte y THistorial
Ejecutar después de crear las migraciones y aplicarlas
"""

import os
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from tablas_maestras.models import TTipoReporte

def poblar_tipos_reporte():
    """Crear tipos de reporte iniciales"""
    tipos_reporte = [
        {
            'TRHTipoReporte': 'Mora',
            'TRDescripcion': 'Incumplimiento en el pago del canon de arrendamiento'
        },
        {
            'TRHTipoReporte': 'Daño a la propiedad',
            'TRDescripcion': 'Daños causados al inmueble arrendado'
        },
        {
            'TRHTipoReporte': 'Incumplimiento de contrato',
            'TRDescripcion': 'Violación de términos contractuales'
        },
        {
            'TRHTipoReporte': 'Vencimiento',
            'TRDescripcion': 'Contrato de arrendamiento vencido'
        },
        {
            'TRHTipoReporte': 'Pago anticipado',
            'TRDescripcion': 'Pago del canon antes de la fecha establecida'
        }
    ]

    for tipo_data in tipos_reporte:
        tipo, created = TTipoReporte.objects.get_or_create(
            TRHTipoReporte=tipo_data['TRHTipoReporte'],
            defaults={'TRDescripcion': tipo_data['TRDescripcion']}
        )
        if created:
            print(f"✓ Creado tipo de reporte: {tipo.TRHTipoReporte}")
        else:
            print(f"ℹ Tipo de reporte ya existe: {tipo.TRHTipoReporte}")

if __name__ == '__main__':
    print("Poblando tipos de reporte...")
    poblar_tipos_reporte()
    print("¡Completado!")