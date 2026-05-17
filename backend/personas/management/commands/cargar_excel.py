import pandas as pd
from django.core.management.base import BaseCommand
from personas.models import TCiudades

class Command(BaseCommand):
    help = 'Carga datos en la tabla TCiudades desde un archivo Excel con Diagnóstico'

    def handle(self, *args, **options):
        ruta_excel = '/app/backend/personas/data/ciudades.xlsx'
        self.stdout.write(self.style.WARNING(f"Cargando archivo desde: {ruta_excel}..."))
        
        try:
            df = pd.read_excel(ruta_excel)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error crítico al leer el Excel: {e}"))
            return

        # --- SECCIÓN DE DIAGNÓSTICO TOTALMENTE SEGURA ---
        self.stdout.write("--- DIAGNÓSTICO DEL ARCHIVO ---")
        self.stdout.write(f"Columnas detectadas en el Excel: {list(df.columns)}")
        self.stdout.write(f"Total de filas leídas por Pandas: {len(df)}")
        if len(df) > 0:
            self.stdout.write(f"Primera fila del Excel como muestra: {df.iloc[0].to_dict()}")
        self.stdout.write("--------------------------------")

        ciudades_existentes = set(TCiudades.objects.values_list('TCNombre', 'TCDepartamento'))
        ciudades_a_crear = []

        for index, fila in df.iterrows():
            col_nombre = [c for c in df.columns if str(c).strip() == 'TCNombre']
            col_pais = [c for c in df.columns if str(c).strip() == 'TCPais']
            col_depto = [c for c in df.columns if str(c).strip() == 'TCDepartamento']

            if not col_nombre or not col_depto:
                continue

            val_nombre = fila[col_nombre[0]]
            val_pais = fila[col_pais[0]] if col_pais else 'Colombia'
            val_depto = fila[col_depto[0]]

            if pd.isna(val_nombre) or pd.isna(val_depto):
                continue

            nombre = str(val_nombre).strip()
            pais = str(val_pais).strip() if not pd.isna(val_pais) else 'Colombia'
            departamento = str(val_depto).strip()

            llave_registro = (nombre, departamento)

            if llave_registro not in ciudades_existentes:
                ciudades_a_crear.append(
                    TCiudades(
                        TCNombre=nombre,
                        TCPais=pais,
                        TCDepartamento=departamento
                    )
                )
                ciudades_existentes.add(llave_registro)

        if ciudades_a_crear:
            TCiudades.objects.bulk_create(ciudades_a_crear)
            self.stdout.write(self.style.SUCCESS(f"¡Éxito! Se guardaron {len(ciudades_a_crear)} ciudades."))
        else:
            self.stdout.write(self.style.WARNING("No se guardó ningún registro."))
