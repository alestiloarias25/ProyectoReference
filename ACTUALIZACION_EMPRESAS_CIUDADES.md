# ACTUALIZACIÓN: Campos Dropdown para Empresas y Ciudades en TPersona

## Resumen de Cambios

Se ha implementado un sistema de campos dropdown para **TEId (Empresa)** y **TCId (Ciudad)** en el formulario de ingreso de datos en TPersona, con la capacidad de crear nuevos registros sobre la marcha.

## Cambios Realizados

### 1. Backend - Modelos (referencias/models.py)
- ✅ Agregados modelos `TEmpresas` y `TCiudades` con auto-incremento de IDs
- ✅ TEmpresas: TEId (PK), TEDescripcion, TEContacto, TEFono, TEEmail
- ✅ TCiudades: TCId (PK), TCDescripcion, TCDepartamento

### 2. Backend - Modelos (personas/models.py)
- ✅ Actualizado campo `TEId` de CharField a ForeignKey(TEmpresas)
- ✅ Actualizado campo `TCId` de CharField a ForeignKey(TCiudades)
- ✅ Actualizado campo `TPBarriosZona` para ser nullable (blank=True, null=True)

### 3. Backend - Vistas (personas/views.py)
- ✅ Agregados ViewSets: `TEmpresasViewSet` y `TCiudadesViewSet`
- ✅ Ambos con permisos de autenticación IsAuthenticated

### 4. Backend - Serializadores (personas/serializers.py)
- ✅ Creados `TEmpresasSerializer` y `TCiudadesSerializer`
- ✅ Actualizado `PersonaSerializer` para:
  - Mostrar objetos completos de Empresa y Ciudad (read_only)
  - Aceptar IDs para escritura (write_only con PrimaryKeyRelatedField)

### 5. Backend - URLs (personas/urls.py)
- ✅ Registrados endpoints:
  - `/api/empresas/` - CRUD completo
  - `/api/ciudades/` - CRUD completo
  - `/api/persona/` - Ya existente, ahora con ForeignKeys

### 6. Backend - Admin (referencias/admin.py)
- ✅ Registrados modelos TEmpresas y TCiudades en Django Admin

### 7. Frontend - Componente "Paso 1" (PasoPersonas.js)
- ✅ Actualizado para cargar listas de empresas y ciudades del API
- ✅ Reemplazados inputs de texto por `<select>` dropdowns
- ✅ Agregados botones "+ Crear Empresa" y "+ Crear Ciudad"
- ✅ Implementados formularios emergentes para crear nuevos registros
- ✅ Validación: TEId y TCId son requeridos
- ✅ Los IDs de nuevos registros se seleccionan automáticamente

### 8. Base de Datos - Migraciones
- ✅ Migración referencias/0007: Crea modelos TEmpresas y TCiudades
- ✅ Migración referencias/0008: Agrega columnas faltantes a tablas existentes
- ✅ Migración personas/0008: Actualiza campos TEId y TCId a ForeignKey

## Datos Iniciales Cargados

### Empresas (3 registros)
- Constructora ABC (Juan Pérez)
- Inmobiliaria XYZ (María García)
- Soluciones Inmobiliarias (Carlos López)

### Ciudades (3 registros)
- Bogotá (Cundinamarca)
- Medellín (Antioquia)
- Cali (Valle del Cauca)

## Flujo de Uso - Frontend

1. **Al cargar PasoPersonas:**
   - Se cargan automáticamente las listas de empresas y ciudades del API
   - Se muestran como dropdowns en el formulario

2. **Para seleccionar empresa o ciudad:**
   - El usuario abre el dropdown y elige la opción
   - El ID correspondiente se asigna al formulario

3. **Para crear una nueva empresa:**
   - Usuario hace clic en "+ Crear Empresa"
   - Se muestra formulario con campos: Descripción, Contacto, Teléfono, Email
   - Al guardar, la empresa se crea en la BD y se selecciona automáticamente
   - El formulario se oculta

4. **Para crear una nueva ciudad:**
   - Mismo flujo que empresa, con campos: Descripción, Departamento

5. **Al guardar persona:**
   - Los IDs (números) se envían al API como ForeignKey
   - El API devuelve los objetos completos (Empresa y Ciudad anidadas)

## API Endpoints

### Empresas
```
GET    /api/empresas/           - Listar todas
POST   /api/empresas/           - Crear nueva
GET    /api/empresas/{id}/      - Obtener una
PUT    /api/empresas/{id}/      - Actualizar
DELETE /api/empresas/{id}/      - Eliminar
```

### Ciudades
```
GET    /api/ciudades/           - Listar todas
POST   /api/ciudades/           - Crear nueva
GET    /api/ciudades/{id}/      - Obtener una
PUT    /api/ciudades/{id}/      - Actualizar
DELETE /api/ciudades/{id}/      - Eliminar
```

### Personas (Actualizado)
```
GET    /api/persona/            - Listar todas (con Empresa/Ciudad anidadas)
POST   /api/persona/            - Crear nueva
GET    /api/persona/{id}/       - Obtener una
PUT    /api/persona/{id}/       - Actualizar
DELETE /api/persona/{id}/       - Eliminar
```

## Ejemplo de Request/Response

### Crear Persona
```json
// REQUEST (POST /api/persona/)
{
  "TPTipoDocumento": "CC",
  "TPNoDocumento": "1234567890",
  "TPNombres": "Juan",
  "TPApellidos": "Pérez",
  "TPDireccionResidencia": "Cra 5 # 10-30",
  "TPCelular1": "+57 3101234567",
  "TPCelular2": null,
  "TEId_id": 1,        // ID de empresa
  "TCId_id": 1,        // ID de ciudad
  "TPBarriosZona": "Centro"
}

// RESPONSE (200 OK)
{
  "TPTipoDocumento": "CC",
  "TPNoDocumento": "1234567890",
  "TPNombres": "Juan",
  "TPApellidos": "Pérez",
  "TPDireccionResidencia": "Cra 5 # 10-30",
  "TPCelular1": "+57 3101234567",
  "TPCelular2": null,
  "TEId": {
    "TEId": 1,
    "TEDescripcion": "Constructora ABC",
    "TEContacto": "Juan Pérez",
    "TEFono": "+57 1 2345678",
    "TEEmail": "contacto@constructora.com"
  },
  "TCId": {
    "TCId": 1,
    "TCDescripcion": "Bogotá",
    "TCDepartamento": "Cundinamarca"
  },
  "TPBarriosZona": "Centro",
  "TPPuntaje": 1000
}
```

## Scripts de Utilidad

### setup_data.py
- Popula datos iniciales en TEmpresas y TCiudades
- Uso: `python setup_data.py`

### crear_migraciones.py
- Documenta instrucciones para crear y aplicar migraciones
- Uso: `python crear_migraciones.py` (informativo)

## Notas Importantes

1. **Validación en Frontend:** Ambos campos (TEId y TCId) son obligatorios
2. **Creación de Registros:** El usuario puede crear nuevas empresas/ciudades sin salir del formulario
3. **Valores Predeterminados:** Las nuevas Personas tienen TPPuntaje = 1000 por defecto
4. **Cascadas:** Si se intenta eliminar Empresa/Ciudad con Personas asociadas, se rechaza (PROTECT)
5. **Admin Panel:** Las nuevas tablas están disponibles en `/admin/`

## Próximos Pasos Sugeridos

1. ✅ Migraciones aplicadas
2. ✅ Datos iniciales cargados  
3. ✅ Frontend actualizado con dropdowns
4. 📋 **Siguiente:** Reiniciar servidor frontend (`npm start`)
5. 📋 Probar creación de personas con nuevas empresas/ciudades
6. 📋 Verificar que el campo TPPuntaje se asigna correctamente

---
**Fecha:** 30 de Marzo de 2026  
**Estado:** ✅ COMPLETADO
