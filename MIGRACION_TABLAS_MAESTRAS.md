# Guía de Migración a Supabase - Tablas Maestras

## Descripción General
Se ha creado una nueva aplicación Django `tablas_maestras` que consolidada todas las tablas sueltas de configuración del sistema para facilitar la migración a Supabase.

## Tablas Incluidas en `tablas_maestras`

### 1. **TEmpresas**
- Tabla maestra de empresas
- Campos: TEId, TENit, TENombre, TEDireccion, TECelular, TETelefono, TEEmail, TEContacto, TEDescripcion, TEActivo, TEFechaCreacion, TEFechaActualizacion
- Base de datos: `tempresas`
- API: `/api/tablas-maestras/empresas/`

### 2. **TCiudades**
- Tabla maestra de ciudades
- Campos: TCId, TCNombre, TCDepartamento, TCPais, TCDescripcion, TCCodigo, TCActivo, TCFechaCreacion, TCFechaActualizacion
- Base de datos: `tciudades`
- API: `/api/tablas-maestras/ciudades/`

### 3. **TPuntajeColor**
- Tabla de configuración de colores para rangos de puntaje
- Campos: TPCNivel, TPCValorInicial, TPCValorFinal, TPCColor, TPCEvaluacion, TPCComentario, TPCActivo, TPCFechaCreacion, TPCFechaActualizacion
- Base de datos: `tpuntajecolor`
- API: `/api/tablas-maestras/puntaje-color/`

### 4. **TTipoReporte**
- Tabla maestra de tipos de reporte
- Campos: TRHTipoReporte, TRDescripcion, TRPeso, TRActivo, TRFechaCreacion, TRFechaActualizacion
- Base de datos: `ttiporeporte`
- API: `/api/tablas-maestras/tipo-reporte/`

## Estructura de Archivos Creados

```
backend/tablas_maestras/
├── __init__.py
├── apps.py                 # Configuración de la aplicación
├── models.py              # Definición de modelos
├── serializers.py         # Serializadores DRF
├── views.py               # ViewSets y lógica API
├── urls.py                # Rutas de los endpoints
├── admin.py               # Configuración de admin
├── tests.py               # Tests unitarios
└── migrations/
    ├── __init__.py
    └── 0001_initial.py    # Migración inicial
```

## Cambios Realizados en Archivos Existentes

### 1. `backend/backend/settings.py`
- Agregada `'tablas_maestras'` a `INSTALLED_APPS`

### 2. `backend/backend/urls.py`
- Agregada ruta: `path('api/tablas-maestras/', include('tablas_maestras.urls'))`

## Endpoints de API

### Empresas
- `GET /api/tablas-maestras/empresas/` - Listar todas las empresas
- `POST /api/tablas-maestras/empresas/` - Crear nueva empresa
- `GET /api/tablas-maestras/empresas/{id}/` - Obtener empresa por ID
- `PUT /api/tablas-maestras/empresas/{id}/` - Actualizar empresa
- `DELETE /api/tablas-maestras/empresas/{id}/` - Eliminar empresa

### Ciudades
- `GET /api/tablas-maestras/ciudades/` - Listar todas las ciudades
- `POST /api/tablas-maestras/ciudades/` - Crear nueva ciudad
- `GET /api/tablas-maestras/ciudades/{id}/` - Obtener ciudad por ID
- `PUT /api/tablas-maestras/ciudades/{id}/` - Actualizar ciudad
- `DELETE /api/tablas-maestras/ciudades/{id}/` - Eliminar ciudad

### Puntaje Color
- `GET /api/tablas-maestras/puntaje-color/` - Listar todas las configuraciones
- `POST /api/tablas-maestras/puntaje-color/` - Crear nueva configuración
- `GET /api/tablas-maestras/puntaje-color/{nivel}/` - Obtener por nivel
- `PUT /api/tablas-maestras/puntaje-color/{nivel}/` - Actualizar configuración
- `DELETE /api/tablas-maestras/puntaje-color/{nivel}/` - Eliminar configuración

### Tipo Reporte
- `GET /api/tablas-maestras/tipo-reporte/` - Listar todos los tipos
- `POST /api/tablas-maestras/tipo-reporte/` - Crear nuevo tipo
- `GET /api/tablas-maestras/tipo-reporte/{id}/` - Obtener tipo por ID
- `PUT /api/tablas-maestras/tipo-reporte/{id}/` - Actualizar tipo
- `DELETE /api/tablas-maestras/tipo-reporte/{id}/` - Eliminar tipo

## Filtros y Búsqueda Disponibles

### Empresas
- Filtrar por: `TEActivo`
- Buscar en: `TENombre`, `TEDescripcion`, `TENit`, `TEEmail`
- Ordenar por: `TEId`, `TENombre`, `TEFechaCreacion`

### Ciudades
- Filtrar por: `TCActivo`, `TCDepartamento`, `TCPais`
- Buscar en: `TCNombre`, `TCDescripcion`, `TCCodigo`
- Ordenar por: `TCId`, `TCNombre`, `TCFechaCreacion`

### Puntaje Color
- Filtrar por: `TPCActivo`
- Ordenar por: `TPCValorInicial`

### Tipo Reporte
- Filtrar por: `TRActivo`
- Buscar en: `TRHTipoReporte`, `TRDescripcion`
- Ordenar por: `TRHTipoReporte`, `TRPeso`

## Pasos para Aplicar las Migraciones

1. **Activar el entorno virtual**:
```bash
venv\Scripts\Activate.ps1
```

2. **Aplicar migraciones**:
```bash
python manage.py migrate
```

3. **Crear superusuario (si es necesario)**:
```bash
python manage.py createsuperuser
```

4. **Verificar que la app está registrada correctamente**:
```bash
python manage.py check
```

5. **Ejecutar tests**:
```bash
python manage.py test tablas_maestras
```

## Próximos Pasos para Migración a Supabase

1. **Transferencia de datos existentes desde referencias.models**:
   - Crear script de migración de datos desde las tablas antiguas a las nuevas tablas maestras
   - Validar integridad referencial

2. **Actualizar imports en otras aplicaciones**:
   - Cambiar `from referencias.models import TEmpresas, TCiudades` a `from tablas_maestras.models import TEmpresas, TCiudades`
   - Cambiar `from referencias.models import TPuntajeColor, TTipoReporte` a `from tablas_maestras.models import TPuntajeColor, TTipoReporte`

3. **Actualizar serializers en referencias**:
   - Remover duplicados de serializers y usar los de tablas_maestras

4. **Deprecar modelos antiguos en referencias**:
   - Una vez migrados todos los datos, remover modelos duplicados de referencias.models

5. **Documentación de fuentes de datos**:
   - Actualizar documentación de API para reflejar nuevos endpoints

## Consideraciones para Supabase

- ✅ Los modelos utilizan nombres de tablas explícitos (`db_table`)
- ✅ Las claves primarias están bien definidas
- ✅ Las relaciones están preparadas para migración
- ✅ Se incluyen timestamps de creación y actualización
- ✅ Se incluye campo de estado (Activo/Inactivo) para auditoría
- ✅ Contraseñas y credenciales sensibles están fuera de los modelos

## Rollback en caso de problemas

```bash
python manage.py migrate tablas_maestras zero
```

---

**Creado**: Abril 2026
**Aplicación**: Django 5.2.8
**Python**: 3.11+
