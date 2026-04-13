# Script de Utilidades para Tablas Maestras

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command
from tablas_maestras.models import TEmpresas, TCiudades, TPuntajeColor, TTipoReporte

def check_duplicate_tables():
    """Verifica si hay datos en las tablas antiguas de referencias"""
    print("=" * 60)
    print("VERIFICANDO DATOS EN REFERENCIAS")
    print("=" * 60)
    
    try:
        from tablas_maestras.models import (
            TEmpresas as TEmpresas_old,
            TCiudades as TCiudades_old,
            TPuntajeColor as TPuntajeColor_old,
            TTipoReporte as TTipoReporte_old,
        )
        
        print(f"\n📊 Empresas en referencias.TEmpresas: {TEmpresas_old.objects.count()}")
        print(f"📊 Ciudades en referencias.TCiudades: {TCiudades_old.objects.count()}")
        print(f"📊 Puntaje Color en referencias.TPuntajeColor: {TPuntajeColor_old.objects.count()}")
        print(f"📊 Tipo Reporte en referencias.TTipoReporte: {TTipoReporte_old.objects.count()}")
        
        return (
            TEmpresas_old.objects.count() > 0 or
            TCiudades_old.objects.count() > 0 or
            TPuntajeColor_old.objects.count() > 0 or
            TTipoReporte_old.objects.count() > 0
        )
    except Exception as e:
        print(f"⚠️  Error al verificar modelos antiguos: {e}")
        return False


def check_new_tables():
    """Verifica si hay datos en las tablas nuevas de tablas_maestras"""
    print("\n" + "=" * 60)
    print("VERIFICANDO DATOS EN TABLAS_MAESTRAS")
    print("=" * 60)
    
    print(f"\n📊 Empresas en tablas_maestras.TEmpresas: {TEmpresas.objects.count()}")
    print(f"📊 Ciudades en tablas_maestras.TCiudades: {TCiudades.objects.count()}")
    print(f"📊 Puntaje Color en tablas_maestras.TPuntajeColor: {TPuntajeColor.objects.count()}")
    print(f"📊 Tipo Reporte en tablas_maestras.TTipoReporte: {TTipoReporte.objects.count()}")


def migrate_data():
    """Migra datos de referencias a tablas_maestras"""
    print("\n" + "=" * 60)
    print("INICIANDO MIGRACIÓN DE DATOS")
    print("=" * 60)
    
    try:
        from tablas_maestras.models import (
            TEmpresas as TEmpresas_old,
            TCiudades as TCiudades_old,
            TPuntajeColor as TPuntajeColor_old,
            TTipoReporte as TTipoReporte_old,
        )
        
        # Migrar Empresas
        print("\n🏢 Migrando Empresas...")
        empresas_count = 0
        for empresa_old in TEmpresas_old.objects.all():
            try:
                obj, created = TEmpresas.objects.update_or_create(
                    TEId=empresa_old.TEId,
                    defaults={
                        'TENit': empresa_old.TENit,
                        'TENombre': empresa_old.TENombre,
                        'TEDireccion': empresa_old.TEDireccion,
                        'TECelular': empresa_old.TECelular,
                        'TETelefono': empresa_old.TETelefono,
                        'TEEmail': empresa_old.TEEmail,
                        'TEContacto': empresa_old.TEContacto,
                        'TEDescripcion': empresa_old.TEDescripcion,
                    }
                )
                empresas_count += 1
            except Exception as e:
                print(f"   ⚠️  Error migrando empresa {empresa_old.TEId}: {e}")
        
        print(f"   ✓ {empresas_count} empresas migradas")
        
        # Migrar Ciudades
        print("\n🏙️  Migrando Ciudades...")
        ciudades_count = 0
        for ciudad_old in TCiudades_old.objects.all():
            try:
                obj, created = TCiudades.objects.update_or_create(
                    TCId=ciudad_old.TCId,
                    defaults={
                        'TCNombre': ciudad_old.TCNombre,
                        'TCDepartamento': ciudad_old.TCDepartamento,
                        'TCPais': ciudad_old.TCPais,
                        'TCDescripcion': ciudad_old.TCDescripcion,
                    }
                )
                ciudades_count += 1
            except Exception as e:
                print(f"   ⚠️  Error migrando ciudad {ciudad_old.TCId}: {e}")
        
        print(f"   ✓ {ciudades_count} ciudades migradas")
        
        # Migrar Puntaje Color
        print("\n🎨 Migrando Puntaje Color...")
        pc_count = 0
        for pc_old in TPuntajeColor_old.objects.all():
            try:
                obj, created = TPuntajeColor.objects.update_or_create(
                    TPCNivel=pc_old.TPCNivel,
                    defaults={
                        'TPCValorInicial': pc_old.TPCValorInicial,
                        'TPCValorFinal': pc_old.TPCValorFinal,
                        'TPCColor': pc_old.TPCColor,
                        'TPCEvaluacion': getattr(pc_old, 'TPCEvaluacion', ''),
                        'TPCComentario': getattr(pc_old, 'TPCComentario', ''),
                    }
                )
                pc_count += 1
            except Exception as e:
                print(f"   ⚠️  Error migrando puntaje {pc_old.TPCNivel}: {e}")
        
        print(f"   ✓ {pc_count} configuraciones de puntaje migradas")
        
        # Migrar Tipo Reporte
        print("\n📋 Migrando Tipo Reporte...")
        tr_count = 0
        for tr_old in TTipoReporte_old.objects.all():
            try:
                obj, created = TTipoReporte.objects.update_or_create(
                    TRHTipoReporte=tr_old.TRHTipoReporte,
                    defaults={
                        'TRDescripcion': tr_old.TRDescripcion,
                        'TRPeso': tr_old.TRPeso,
                    }
                )
                tr_count += 1
            except Exception as e:
                print(f"   ⚠️  Error migrando tipo {tr_old.TRHTipoReporte}: {e}")
        
        print(f"   ✓ {tr_count} tipos de reporte migrados")
        
        print("\n" + "=" * 60)
        print("✅ MIGRACIÓN COMPLETADA CON ÉXITO")
        print("=" * 60)
        
        return True
        
    except ImportError as e:
        print(f"❌ Error: No se pudieron importar los modelos antiguos de referencias")
        print(f"   Detalle: {e}")
        return False
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        import traceback
        traceback.print_exc()
        return False


def show_menu():
    """Muestra menú de opciones"""
    print("\n" + "=" * 60)
    print("UTILIDADES PARA MIGRACIÓN A TABLAS MAESTRAS")
    print("=" * 60)
    print("\nOpciones:")
    print("  1. Verificar datos en ambas tablas")
    print("  2. Migrar datos de referencias a tablas_maestras")
    print("  3. Verificar solo tablas nuevas")
    print("  4. Verificar solo tablas antiguas")
    print("  5. Ejecutar check de Django")
    print("  6. Salir")
    print("-" * 60)


def main():
    """Función principal"""
    while True:
        show_menu()
        choice = input("\nSelecciona una opción (1-6): ").strip()
        
        if choice == "1":
            has_data = check_duplicate_tables()
            check_new_tables()
            if has_data:
                print("\n⚠️  Se encontraron datos en las tablas antiguas.")
                print("    Considera ejecutar la opción 2 para migrar.")
            
        elif choice == "2":
            print("\n⚠️  ADVERTENCIA: Esta operación migrará datos desde referencias")
            print("    Asegúrate de tener un backup antes de continuar.")
            confirm = input("¿Deseas continuar? (s/n): ").strip().lower()
            
            if confirm == 's':
                if migrate_data():
                    print("\n✅ Datos migrados correctamente")
                else:
                    print("\n❌ Error durante la migración")
            else:
                print("Operación cancelada")
                
        elif choice == "3":
            check_new_tables()
            
        elif choice == "4":
            check_duplicate_tables()
            
        elif choice == "5":
            print("\nEjecutando Django check...")
            try:
                call_command('check')
                print("✅ Django check completado")
            except Exception as e:
                print(f"❌ Error en check: {e}")
                
        elif choice == "6":
            print("\n¡Hasta luego!")
            break
            
        else:
            print("❌ Opción inválida. Intenta de nuevo.")


if __name__ == '__main__':
    main()
