import os
import django
import pandas as pd
from django.utils import timezone

# 1. Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') 
django.setup()

# 2. Importar el modelo (Reemplaza 'tu_app' por el nombre de tu app de Django)
from tablas_maestras.models import TCiudades 

def importar():
    excel_path = '/app/backend/personas/data/ciudades.xlsx'
    
    if not os.path.exists(excel_path):
        print(f"Error: No se encuentra el archivo {excel_path} en el contenedor.")
        return

    # Leer el archivo Excel
    df = pd.read_excel(excel_path)
    print(f"Se encontraron {len(df)} filas en el Excel.")

    ciudades_a_crear = []
    ahora = timezone.now()

    for index, row in df.iterrows():
        # Aquí mapeamos las columnas del Excel con los campos de tu modelo
        # Nota: Si en tu Excel las columnas se llaman distinto (ej. 'Nombre', 'Pais'), 
        # cambia lo que está dentro de row['...'] por el nombre exacto de tu Excel.
        ciudad = TCiudades(
            TCId=row['TCId'], 
            TCNombre=row['TCNombre'],
            TCDepartamento=row['TCDepartamento'],
            TCPais=row['TCPais'],
            TCFechaCreacion=ahora,       # Lo rellenamos con la fecha actual
            TCFechaActualizacion=ahora    # Lo rellenamos con la fecha actual
        )
        ciudades_a_crear.append(ciudad)

    print("Insertando datos en la base de datos...")
    # Inserción masiva eficiente
    TCiudades.objects.bulk_create(ciudades_a_crear)
    print("¡Proceso terminado con éxito! Todas las ciudades han sido montadas.")

if __name__ == '__main__':
    importar()
