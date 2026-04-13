# INSTRUCCIONES DE VALIDACIÓN Y PRUEBA

## ✅ Validación del Backend

### 1. Verificar Migraciones Aplicadas
```bash
# Ir al directorio backend
cd backend

# Resumen de migraciones
python manage.py showmigrations referencias personas

# Esperado:
# Referencias: [X] 0007_tciudades_tempresas_...
#             [X] 0008_update_tempresas_tciudades
# Personas:   [X] 0008_remove_persona_id_alter_...
```

### 2. Verificar Datos en la Base de Datos
```bash
# Acceder a Django shell
python manage.py shell

# Dentro de shell:
from referencias.models import TEmpresas, TCiudades

# Listar empresas
print(TEmpresas.objects.all())
# Esperado: <QuerySet [<TEmpresas: 1 - Constructora ABC>, ...]>

# Listar ciudades
print(TCiudades.objects.all())
# Esperado: <QuerySet [<TCiudades: 1 - Bogotá>, ...]>

# Salir
exit()
```

### 3. Probar API de Empresas
```bash
# Terminal 1: Iniciar servidor
python manage.py runserver

# Terminal 2: Probar endpoint
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/empresas/

# Esperado: JSON con lista de empresas
```

### 4. Probar API de Ciudades
```bash
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/ciudades/

# Esperado: JSON con lista de ciudades
```

## ✅ Validación del Frontend

### 1. Verificar Componente PasoPersonas
- Archivo: `frontend/src/pages/contratos/PasoPersonas.js`
- Checkpoints:
  - [ ] Importa axios y useState/useEffect
  - [ ] Define URLs: API_EMPRESAS, API_CIUDADES
  - [ ] Carga datos de empresas y ciudades en useEffect
  - [ ] Renderiza dropdowns `<select>` para TEId y TCId
  - [ ] Botones "+ Crear Empresa" y "+ Crear Ciudad" presentes
  - [ ] Formularios emergentes para crear nuevos registros

### 2. Probar en Navegador
```
Navegación: localhost:3000/contratos/nuevo/
```

#### Test 1: Cargar formulario
- Expected: Dropdowns se cargan con opciones de empresas y ciudades
- Status: [ ]

#### Test 2: Crear nueva empresa
- Click en "+ Crear Empresa"
- Ingresa: "Mi Empresa", "Juan", "+57 3101234567", "juan@empresa.com"
- Click en "Guardar Empresa"
- Expected: Empresa aparece en dropdown y queda seleccionada
- Status: [ ]

#### Test 3: Crear nueva ciudad
- Click en "+ Crear Ciudad"
- Ingresa: "Medellín", "Antioquia" (como ejemplo)
- Click en "Guardar Ciudad"
- Expected: Ciudad aparece en dropdown y queda seleccionada
- Status: [ ]

#### Test 4: Crear persona completa
- Llena todos los campos:
  - Tipo Documento: CC
  - No Documento: 123456789
  - Nombres: Carlos
  - Apellidos: López
  - Dirección: Cra 10 # 20-30
  - Celular 1: +57 3119876543
  - Celular 2: (dejar en blanco)
  - Empresa: Selecciona una
  - Ciudad: Selecciona una
  - Barrio/Zona: Chapinero
- Click en "Agregar persona"
- Expected: Persona aparece en lista de abajo, con empresa y ciudad
- Status: [ ]

## 🔍 Inspección en Navegador

### Chrome DevTools (F12)

#### Network Tab
1. Click en "+ Crear Empresa"
2. Ver en Network → observar POST a `/api/empresas/`
3. Response debe contener: `{"TEId": 4, "TEDescripcion": "...", ...}`

#### Console Tab
- No debe haber errores en rojo
- Puede haber warnings (amarillo) - OK
- Verificar que no hay "undefined" variables

## 🐛 Troubleshooting

### Problema: Dropdowns no cargan datos
**Solución:**
1. Verificar que el servidor Django está corriendo
2. Verificar token de autenticación en localStorage
3. Ver Network tab en DevTools para errores de API

### Problema: No puedo crear empresa
**Solución:**
1. Verificar conexión a backend
2. Ver Network tab para detalles del error
3. Verificar datos requeridos: TEDescripcion es obligatorio

### Problema: NPM error al iniciar frontend
**Solución:**
```bash
# Reiniciar npm
npm start

# Si persiste:
rm -r node_modules package-lock.json
npm install
npm start
```

### Problema: Error de migración
**Solución:**
```bash
# Resetear migraciones (⚠️ CUIDADO: Elimina datos)
python manage.py migrate personas zero
python manage.py migrate referencias zero

# Luego aplicar de nuevo
python manage.py migrate
```

## 📊 Verificación SQL (PostgreSQL)

```sql
-- Verificar tabla tempresas
SELECT * FROM tempresas;
-- Esperado: 2+ registros con TEDescripcion

-- Verificar tabla tciudades
SELECT * FROM tciudades;
-- Esperado: 3+ registros con TCDescripcion

-- Verificar personas con foreign keys
SELECT TPNoDocumento, TPNombres, TEId, TCId FROM tpersonas LIMIT 5;
-- Esperado: TEId y TCId contienen IDs de empresas y ciudades
```

## 📋 Checklist Final

### Backend
- [ ] Migraciones aplicadas exitosamente
- [ ] Datos iniciales cargados (2 empresas, 3 ciudades)
- [ ] Endpoints `/api/empresas/` funcionan
- [ ] Endpoints `/api/ciudades/` funcionan
- [ ] Endpoint `/api/persona/` acepta TEId_id y TCId_id

### Frontend
- [ ] PasoPersonas.js cargado sin errores
- [ ] Dropdowns cargan datos dinámicamente
- [ ] Botones de crear empresas/ciudades funcionan
- [ ] Nuevos registros aparecen en dropdowns
- [ ] Persona se crea con empresas/ciudades correctas

### Base de Datos
- [ ] tablas tempresas y tciudades existen
- [ ] Columnas correspondientes presentes
- [ ] Foreign keys en tpersonas funcionan
- [ ] Datos iniciales insertados

---

**Completar checklist antes de considerar la tarea como "DONE"**
