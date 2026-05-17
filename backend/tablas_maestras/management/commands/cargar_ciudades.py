import os
import pandas as pd
from django.core.management.base import BaseCommand
from django.utils import timezone
from tablas_maestras.models import TCiudades

class Command(BaseCommand):
    help = 'Carga las ciudades desde el archivo Excel a la base de datos PostgreSQL'

    def handle(self, *args, **options):
        # La ruta del Excel dentro del contenedor
        excel_path = '/app/backend/personas/data/ciudades.xlsx'
        
        if not os.path.exists(excel_path):
            self.stdout.write(self.style.ERROR(f"No se encuentra el archivo en: {excel_path}"))
            return

        # Leer el archivo Excel
        df = pd.read_excel(excel_path)
        self.stdout.write(f"Se encontraron {len(df)} filas en el Excel.")

        ciudades_a_crear = []
        ahora = timezone.now()

        for index, row in df.iterrows():
            ciudad = TCiudades(
                TCId=row['TCId'], 
                TCNombre=row['TCNombre'],
                TCDepartamento=row['TCDepartamento'],
                TCPais=row['TCPais'],
                TCFechaCreacion=ahora,
                TCFechaActualizacion=ahora
            )
            ciudades_a_crear.append(ciudad)

        self.stdout.write("Insertando datos en PostgreSQL...")
        TCiudades.objects.bulk_create(ciudades_a_crear)
        
        self.stdout.write(self.style.SUCCESS("¡Proceso terminado con éxito! Ciudades montadas."))
