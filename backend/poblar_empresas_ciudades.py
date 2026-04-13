"""
Script para poblar datos iniciales en las tablas TEmpresas y TCiudades

Ejecutar después de aplicar las migraciones:
python manage.py shell < poblar_empresas_ciudades.py
"""

from tablas_maestras.models import TEmpresas, TCiudades

def poblar_empresas():
    """Crea empresas de ejemplo"""
    empresas = [
        {
            'TEDescripcion': 'Constructora ABC',
            'TEContacto': 'Juan Pérez',
            'TEFono': '+57 1 2345678',
            'TEEmail': 'contacto@constructoraabc.com'
        },
        {
            'TEDescripcion': 'Inmobiliaria XYZ',
            'TEContacto': 'María García',
            'TEFono': '+57 1 9876543',
            'TEEmail': 'info@inmobiliariaxyz.com'
        },
        {
            'TEDescripcion': 'Soluciones Inmobiliarias',
            'TEContacto': 'Carlos López',
            'TEFono': '+57 1 5555555',
            'TEEmail': 'contacto@soluciones.com'
        },
    ]
    
    for empresa in empresas:
        try:
            obj, created = TEmpresas.objects.get_or_create(
                TEDescripcion=empresa['TEDescripcion'],
                defaults={
                    'TEContacto': empresa['TEContacto'],
                    'TEFono': empresa['TEFono'],
                    'TEEmail': empresa['TEEmail'],
                }
            )
            if created:
                print(f"✅ Empresa creada: {empresa['TEDescripcion']}")
            else:
                print(f"ℹ️ Empresa ya existe: {empresa['TEDescripcion']}")
        except Exception as e:
            print(f"❌ Error creando empresa {empresa['TEDescripcion']}: {e}")


def poblar_ciudades():
    """Crea ciudades de ejemplo"""
    ciudades = [
        {
            'TCDescripcion': 'Bogotá',
            'TCDepartamento': 'Cundinamarca'
        },
        {
            'TCDescripcion': 'Medellín',
            'TCDepartamento': 'Antioquia'
        },
        {
            'TCDescripcion': 'Cali',
            'TCDepartamento': 'Valle del Cauca'
        },
        {
            'TCDescripcion': 'Barranquilla',
            'TCDepartamento': 'Atlántico'
        },
        {
            'TCDescripcion': 'Cartagena',
            'TCDepartamento': 'Bolívar'
        },
        {
            'TCDescripcion': 'Bucaramanga',
            'TCDepartamento': 'Santander'
        },
    ]
    
    for ciudad in ciudades:
        try:
            obj, created = TCiudades.objects.get_or_create(
                TCDescripcion=ciudad['TCDescripcion'],
                defaults={
                    'TCDepartamento': ciudad['TCDepartamento'],
                }
            )
            if created:
                print(f"✅ Ciudad creada: {ciudad['TCDescripcion']}")
            else:
                print(f"ℹ️ Ciudad ya existe: {ciudad['TCDescripcion']}")
        except Exception as e:
            print(f"❌ Error creando ciudad {ciudad['TCDescripcion']}: {e}")


if __name__ == '__main__':
    print("\n" + "="*60)
    print("POBLACIÓN DE DATOS INICIALES")
    print("="*60 + "\n")
    
    print("📋 Creando Empresas...")
    poblar_empresas()
    print()
    
    print("📍 Creando Ciudades...")
    poblar_ciudades()
    print()
    
    print("=" * 60)
    print("✅ Poblaciones completadas")
    print("=" * 60)
