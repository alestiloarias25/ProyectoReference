# Script de Migración - Paso 2: Consolidar Modelos en Tablas Maestras

## Problema Detectado
Django detectó que los mismos nombres de tabla (`tciudades`, `tempresas`, `tpuntajecolor`, `ttiporeporte`) están duplicados en dos aplicaciones:
- `referencias.models` (ubicación original)
- `tablas_maestras.models` (nueva ubicación)

## Solución

### OPCIÓN A: Remover modelos de referencias.py (RECOMENDADO SI NO HAY DATOS EXISTENTES)

#### Paso 1: Crear migración de referencia para eliminar modelos duplicados

```bash
python manage.py makemigrations referencias --name remove_duplicate_models
```

#### Paso 2: Decidir sobre los datos existentes
Si ya hay datos en la base de datos bajo estas tablas:
- Opción A1: Mantener datos en las tablas existentes (sin migrar)
- Opción A2: Migrar datos a la nueva app (recomendado)

### OPCIÓN B: Usar la tabla existente en referencias (SI YA HAY DATOS)

Si ya hay datos en las tablas de `referencias`, entonces:

1. **Remover los modelos nuevos de `tablas_maestras`** y en su lugar usar referencias como alias
2. **Actualizar imports** en todas las aplicaciones para usar `referencias`

### OPCIÓN C: Migración de Datos (RECOMENDADO PARA SUPABASE)

Para hacer una migración limpia a Supabase:

1. **Verificar datos en referencias**
2. **Crear script de migración de datos**
3. **Remover modelos duplicados de referencias**
4. **Actualizar todos los imports**

## Pasos Recomendados

### 1. Verificar qué tablas existen en la BD

```bash
python manage.py dbshell
```

```sql
-- En PostgreSQL
\dt
-- Buscar: tciudades, tempresas, tpuntajecolor, ttiporeporte
```

### 2. Verificar cuántos datos hay

```bash
python manage.py shell
```

```python
from referencias.models import TEmpresas, TCiudades, TPuntajeColor, TTipoReporte

print(f"Empresas: {TEmpresas.objects.count()}")
print(f"Ciudades: {TCiudades.objects.count()}")
print(f"Puntaje Color: {TPuntajeColor.objects.count()}")
print(f"Tipo Reporte: {TTipoReporte.objects.count()}")
```

### 3. Si hay datos, crear script de migración

Crear archivo `backend/migrate_to_tablas_maestras.py`:

```python
from referencias.models import (
    TEmpresas as TEmpresas_old,
    TCiudades as TCiudades_old,
    TPuntajeColor as TPuntajeColor_old,
    TTipoReporte as TTipoReporte_old,
)
from tablas_maestras.models import (
    TEmpresas,
    TCiudades,
    TPuntajeColor,
    TTipoReporte,
)

def migrate_data():
    print("Migrando Empresas...")
    for empresa_old in TEmpresas_old.objects.all():
        TEmpresas.objects.update_or_create(
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
    print(f"✓ {TEmpresas.objects.count()} empresas migradas")

    print("Migrando Ciudades...")
    for ciudad_old in TCiudades_old.objects.all():
        TCiudades.objects.update_or_create(
            TCId=ciudad_old.TCId,
            defaults={
                'TCNombre': ciudad_old.TCNombre,
                'TCDepartamento': ciudad_old.TCDepartamento,
                'TCPais': ciudad_old.TCPais,
                'TCDescripcion': ciudad_old.TCDescripcion,
            }
        )
    print(f"✓ {TCiudades.objects.count()} ciudades migradas")

    print("Migrando Puntaje Color...")
    for pc_old in TPuntajeColor_old.objects.all():
        TPuntajeColor.objects.update_or_create(
            TPCNivel=pc_old.TPCNivel,
            defaults={
                'TPCValorInicial': pc_old.TPCValorInicial,
                'TPCValorFinal': pc_old.TPCValorFinal,
                'TPCColor': pc_old.TPCColor,
                'TPCEvaluacion': pc_old.TPCEvaluacion,
                'TPCComentario': pc_old.TPCComentario,
            }
        )
    print(f"✓ {TPuntajeColor.objects.count()} configuraciones de puntaje migradas")

    print("Migrando Tipo Reporte...")
    for tr_old in TTipoReporte_old.objects.all():
        TTipoReporte.objects.update_or_create(
            TRHTipoReporte=tr_old.TRHTipoReporte,
            defaults={
                'TRDescripcion': tr_old.TRDescripcion,
                'TRPeso': tr_old.TRPeso,
            }
        )
    print(f"✓ {TTipoReporte.objects.count()} tipos de reporte migrados")

if __name__ == '__main__':
    migrate_data()
    print("\\n✓ Migración completada con éxito")
```

Ejecutar con:
```bash
python manage.py shell < migrate_to_tablas_maestras.py
```

### 4. Remover modelos duplicados de referencias.models

Editar `backend/referencias/models.py` y comentar/remover:
```python
# class TEmpresas(models.Model):
# class TCiudades(models.Model):
# class TPuntajeColor(models.Model):
# class TTipoReporte(models.Model):
```

### 5. Crear migración para referencias

```bash
python manage.py makemigrations referencias --name remove_duplicate_models
```

### 6. Actualizar imports en todas las aplicaciones

Cambiar en `backend/personas/models.py`:
```python
# Antes
from referencias.models import TEmpresas, TCiudades

# Después
from tablas_maestras.models import TEmpresas, TCiudades
```

### 7. Aplicar todas las migraciones

```bash
python manage.py migrate
```

### 8. Verificar que todo funciona

```bash
python manage.py check
python manage.py test tablas_maestras
```

## Próximos Pasos

- [ ] Ejecutar `python manage.py check` para identificar el estado actual
- [ ] Verificar si hay datos en las tablas existentes
- [ ] Decidir entre migrar o empezar de cero
- [ ] Ejecutar migraciones
- [ ] Actualizar imports en toda la aplicación
- [ ] Validar la estructura para Supabase

---

**Nota**: Este documento se actualizará conforme avances en el proceso de migración.
