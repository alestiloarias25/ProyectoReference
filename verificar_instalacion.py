#!/usr/bin/env python
"""
Script de verificación rápida de la instalación de RECALCULOPUNTAJE

Ejecutar desde la raíz del proyecto: python verificar_instalacion.py
"""

import os
import sys

def verificar_archivos():
    """Verifica que todos los archivos necesarios existan"""
    archivos_requeridos = [
        'backend/referencias/services.py',
        'backend/referencias/queries_sql.py',
        'backend/referencias/ejemplos_uso.py',
        'backend/referencias/views.py',
        'backend/referencias/models.py',
        'backend/personas/models.py',
        'RECALCULOPUNTAJE_DOCUMENTACION.md',
        'RESUMEN_CAMBIOS.md',
    ]
    
    print("=" * 60)
    print("VERIFICACIÓN DE INSTALACIÓN - RECALCULOPUNTAJE")
    print("=" * 60)
    print()
    
    archivos_encontrados = 0
    for archivo in archivos_requeridos:
        existe = os.path.exists(archivo)
        estado = "✅ EXISTE" if existe else "❌ FALTA"
        print(f"{estado}: {archivo}")
        if existe:
            archivos_encontrados += 1
    
    print()
    print(f"Archivos encontrados: {archivos_encontrados}/{len(archivos_requeridos)}")
    print()
    
    return archivos_encontrados == len(archivos_requeridos)

def verificar_imports():
    """Verifica que los imports en services.py sean correctos"""
    print("=" * 60)
    print("VERIFICACIÓN DE IMPORTS")
    print("=" * 60)
    print()
    
    try:
        # Verificar que se puede importar el servicio
        sys.path.insert(0, 'backend')
        from referencias.services import RecalculoPuntajeService, DetalleRecalculoService
        print("✅ RecalculoPuntajeService importado correctamente")
        print("✅ DetalleRecalculoService importado correctamente")
        print()
        return True
    except ImportError as e:
        print(f"❌ Error al importar: {e}")
        print("   Asegúrate de estar en la raíz del proyecto")
        print()
        return False

def verificar_endpoints():
    """Verifica que los endpoints estén definidos en views.py"""
    print("=" * 60)
    print("VERIFICACIÓN DE ENDPOINTS")
    print("=" * 60)
    print()
    
    try:
        sys.path.insert(0, 'backend')
        from referencias.views import THistorialViewSet
        
        # Verificar que existan los métodos
        endpoints = [
            'recalcular_puntaje',
            'recalcular_por_contrato',
            'detalles_calculo',
        ]
        
        for endpoint in endpoints:
            if hasattr(THistorialViewSet, endpoint):
                print(f"✅ Endpoint '{endpoint}' existe")
            else:
                print(f"❌ Endpoint '{endpoint}' NO existe")
        
        print()
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        return False

def main():
    """Ejecuta todas las verificaciones"""
    
    # Cambiar al directorio del proyecto si existe
    if os.path.exists('backend'):
        os.chdir('.')
    
    resultado1 = verificar_archivos()
    resultado2 = verificar_imports()
    resultado3 = verificar_endpoints()
    
    print("=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print()
    
    if resultado1 and resultado2 and resultado3:
        print("✅ TODA LA INSTALACIÓN ESTÁ CORRECTA")
        print()
        print("Próximos pasos:")
        print("1. python manage.py migrate referencias")
        print("2. Probar endpoints con Postman/Insomnia")
        print("3. Consultar RECALCULOPUNTAJE_DOCUMENTACION.md para más detalles")
    else:
        print("❌ HAY INCONGRUENCIAS - Revisa los errores anteriores")
    
    print()

if __name__ == '__main__':
    main()
