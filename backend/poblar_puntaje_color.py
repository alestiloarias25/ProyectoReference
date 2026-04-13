"""
Script para poblar datos iniciales en la tabla TPuntajeColor

Ejecutar después de aplicar las migraciones:
python manage.py shell < poblar_puntaje_color.py
"""

from tablas_maestras.models import TPuntajeColor

def poblar_puntaje_color():
    """Crea rangos de colores para diferentes niveles de puntaje"""
    
    # Limpiar datos existentes
    TPuntajeColor.objects.all().delete()
    
    # Datos de ejemplo para rangos de puntaje
    rangos_colores = [
        {
            'TPCNivel': 'EXCELENTE',
            'TPCValorInicial': 900,
            'TPCValorFinal': 1000,
            'TPCColor': '#28a745',  # Verde
            'TPCEvaluacion': 'Excelente arrendatario - Muy confiable',
            'TPCComentario': 'Historial impecable, paga puntualmente, sin reportes negativos. Arrendatario de máxima confianza.'
        },
        {
            'TPCNivel': 'BUENO',
            'TPCValorInicial': 700,
            'TPCValorFinal': 899,
            'TPCColor': '#17a2b8',  # Azul
            'TPCEvaluacion': 'Buen arrendatario - Confiable',
            'TPCComentario': 'Buen historial de pagos, pocos o ningún retraso. Arrendatario calificado y recomendado.'
        },
        {
            'TPCNivel': 'REGULAR',
            'TPCValorInicial': 500,
            'TPCValorFinal': 699,
            'TPCColor': '#ffc107',  # Amarillo
            'TPCEvaluacion': 'Arrendatario regular - Requiere seguimiento',
            'TPCComentario': 'Historial mixto con algunos retrasos verificados. Requiere supervisión activa durante el contrato.'
        },
        {
            'TPCNivel': 'MALO',
            'TPCValorInicial': 300,
            'TPCValorFinal': 499,
            'TPCColor': '#fd7e14',  # Naranja
            'TPCEvaluacion': 'Mal arrendatario - Requiere precaución',
            'TPCComentario': 'Múltiples retrasos registrados, deudas verificadas. Se recomienda solicitar garantía adicional o depósito aumentado.'
        },
        {
            'TPCNivel': 'CRÍTICO',
            'TPCValorInicial': 0,
            'TPCValorFinal': 299,
            'TPCColor': '#dc3545',  # Rojo
            'TPCEvaluacion': 'Arrendatario crítico - Alto riesgo',
            'TPCComentario': 'Numerosas deudas sin resolver, demandas registradas. Alto riesgo. NO RECOMENDADO para arrendamiento.'
        }
    ]
    
    # Crear registros
    for rango in rangos_colores:
        try:
            TPuntajeColor.objects.create(**rango)
            print(f"✅ Creado rango: {rango['TPCNivel']} ({rango['TPCValorInicial']}-{rango['TPCValorFinal']}) - {rango['TPCColor']}")
        except Exception as e:
            print(f"❌ Error creando {rango['TPCNivel']}: {e}")
    
    print(f"\n📊 Total de rangos creados: {TPuntajeColor.objects.count()}")

if __name__ == '__main__':
    poblar_puntaje_color()