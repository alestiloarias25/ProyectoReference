# 🔍 EJEMPLOS DE USO - CONSULTAR PUNTAJE DE ARRENDATARIO

## 📋 Índice
1. [Ejemplos con cURL](#ejemplos-con-curl)
2. [Ejemplos con JavaScript/Axios](#ejemplos-con-javascriptaxios)
3. [Casos de Uso Reales](#casos-de-uso-reales)
4. [Respuestas Esperadas](#respuestas-esperadas)
5. [Manejo de Errores](#manejo-de-errores)

---

## 🔗 Ejemplos con cURL

### Prerequisito: Obtener Token
```bash
curl -X POST http://127.0.0.1:8000/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username":"tu_usuario","password":"tu_contraseña"}'

# Respuesta:
# {"token":"abc123def456"}
```

### Ejemplo 1: Búsqueda Exitosa - Arrendatario Bueno
```bash
curl -H "Authorization: Token abc123def456" \
  "http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/?tp_no_documento=1234567890"
```

**Respuesta:**
```json
{
  "tp_no_documento": "1234567890",
  "tp_tipo_documento": "CC",
  "tp_nombres": "Juan",
  "tp_apellidos": "Pérez",
  "tp_direccion": "Calle 123 #45-67",
  "tp_celular": "3001234567",
  "tp_puntaje": 850,
  "tp_nivel": "BUENO",
  "tp_color": "#17a2b8",
  "tp_porcentaje": 85.0,
  "tp_valor_initial": 700,
  "tp_valor_final": 899,
  "mensaje_evaluacion": "Buen arrendatario - Confiable"
}
```

### Ejemplo 2: Búsqueda Exitosa - Arrendatario Excelente
```bash
curl -H "Authorization: Token abc123def456" \
  "http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/?tp_no_documento=9876543210"
```

**Respuesta:**
```json
{
  "tp_no_documento": "9876543210",
  "tp_tipo_documento": "CC",
  "tp_nombres": "María",
  "tp_apellidos": "García",
  "tp_direccion": "Carrera 50 #100-20",
  "tp_celular": "3109876543",
  "tp_puntaje": 950,
  "tp_nivel": "EXCELENTE",
  "tp_color": "#28a745",
  "tp_porcentaje": 95.0,
  "tp_valor_initial": 900,
  "tp_valor_final": 1000,
  "mensaje_evaluacion": "Excelente arrendatario - Muy confiable"
}
```

### Ejemplo 3: Búsqueda Exitosa - Arrendatario Crítico
```bash
curl -H "Authorization: Token abc123def456" \
  "http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/?tp_no_documento=1111111111"
```

**Respuesta:**
```json
{
  "tp_no_documento": "1111111111",
  "tp_tipo_documento": "CC",
  "tp_nombres": "Carlos",
  "tp_apellidos": "Martínez",
  "tp_direccion": "Avenida Principal #200",
  "tp_celular": "3157654321",
  "tp_puntaje": 200,
  "tp_nivel": "CRÍTICO",
  "tp_color": "#dc3545",
  "tp_porcentaje": 20.0,
  "tp_valor_initial": 0,
  "tp_valor_final": 299,
  "mensaje_evaluacion": "Arrendatario crítico - Alto riesgo"
}
```

### Ejemplo 4: Error - Documento No Encontrado
```bash
curl -H "Authorization: Token abc123def456" \
  "http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/?tp_no_documento=9999999999"
```

**Respuesta (404):**
```json
{
  "error": "No se encontró persona con documento: 9999999999"
}
```

### Ejemplo 5: Error - Parámetro Faltante
```bash
curl -H "Authorization: Token abc123def456" \
  "http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/"
```

**Respuesta (400):**
```json
{
  "error": "tp_no_documento es requerido como parámetro de consulta"
}
```

### Ejemplo 6: Error - Sin Autenticación
```bash
curl "http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/?tp_no_documento=1234567890"
```

**Respuesta (401):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## 🔗 Ejemplos con JavaScript/Axios

### Setup Básico
```javascript
import axios from 'axios';

const token = localStorage.getItem('token');
const API_URL = 'http://127.0.0.1:8000/referencias/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Ejemplo 1: Consulta Simple
```javascript
async function consultarPuntaje(documento) {
  try {
    const response = await apiClient.get('/consultar-puntaje/por_documento/', {
      params: { tp_no_documento: documento }
    });
    
    console.log('Resultado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data);
    throw error;
  }
}

// Uso:
consultarPuntaje('1234567890')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Ejemplo 2: Con Manejo de Estados
```javascript
const [documento, setDocumento] = useState('');
const [resultado, setResultado] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleBuscar = async (e) => {
  e.preventDefault();
  
  if (!documento.trim()) {
    setError('Por favor ingresa un documento');
    return;
  }

  setLoading(true);
  setError(null);
  setResultado(null);

  try {
    const response = await apiClient.get('/consultar-puntaje/por_documento/', {
      params: { tp_no_documento: documento }
    });
    setResultado(response.data);
  } catch (err) {
    if (err.response?.status === 404) {
      setError('No se encontró persona con ese documento');
    } else {
      setError(err.response?.data?.error || 'Error al consultar');
    }
  } finally {
    setLoading(false);
  }
};
```

### Ejemplo 3: Función Reutilizable
```javascript
class ConsultaPuntajeService {
  constructor(token) {
    this.client = axios.create({
      baseURL: 'http://127.0.0.1:8000/referencias/api',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async obtenerPorDocumento(documento) {
    return this.client.get('/consultar-puntaje/por_documento/', {
      params: { tp_no_documento: documento }
    });
  }

  async procesarResultado(data) {
    return {
      ...data,
      riesgoAlto: data.tp_porcentaje < 50,
      recomendacion: this.generarRecomendacion(data.tp_nivel)
    };
  }

  generarRecomendacion(nivel) {
    const recomendaciones = {
      'EXCELENTE': 'Proceder sin reservas',
      'BUENO': 'Proceder con confianza',
      'REGULAR': 'Supervisión activa recomendada',
      'MALO': 'Proceder con precaución',
      'CRÍTICO': 'NO RECOMENDADO'
    };
    return recomendaciones[nivel] || 'Sin clasificación';
  }
}

// Uso:
const servicio = new ConsultaPuntajeService(localStorage.getItem('token'));
servicio.obtenerPorDocumento('1234567890')
  .then(response => servicio.procesarResultado(response.data))
  .then(resultado => console.log(resultado))
  .catch(error => console.error(error));
```

### Ejemplo 4: Con Retry y Timeout
```javascript
async function consultarConReintentos(documento, maxReintentos = 3) {
  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      const response = await axios.get(
        'http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/',
        {
          params: { tp_no_documento: documento },
          headers: { 'Authorization': `Token ${localStorage.getItem('token')}` },
          timeout: 5000  // 5 segundos
        }
      );
      return response.data;
    } catch (error) {
      if (intento === maxReintentos) {
        throw error;
      }
      // Esperar exponencialmente antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000 * intento));
    }
  }
}

// Uso:
consultarConReintentos('1234567890')
  .then(data => console.log('Éxito:', data))
  .catch(error => console.error('Falló después de reintentos:', error));
```

---

## 💼 Casos de Uso Reales

### Caso de Uso 1: Decisión Rápida de Arrendamiento
**Escenario:** Arrendador recibe solicitud de arrendamiento

```javascript
// Paso 1: Un nuevo inquilino proporciona su documento
const nuevoInquilino = '1234567890';

// Paso 2: Verificar su perfil
const perfil = await consultarPuntaje(nuevoInquilino);

// Paso 3: Tomar decisión
if (perfil.tp_nivel === 'EXCELENTE' || perfil.tp_nivel === 'BUENO') {
  aprobarArrendamiento(nuevoInquilino);
} else if (perfil.tp_nivel === 'REGULAR') {
  solicitarGarantiaAdicional(nuevoInquilino);
} else {
  rechazarSolicitud(nuevoInquilino);
}
```

### Caso de Uso 2: Monitoreo de Arrendatorio Existente
**Escenario:** Evaluar arrendatorio después de pago atrasado

```javascript
// Paso 1: El puntaje se recalcula automáticamente
// Paso 2: Arrendador consulta el nuevo puntaje
const puntajeActual = await consultarPuntaje('1234567890');

// Paso 3: Si baja, avisar
if (puntajeActual.tp_porcentaje < 60) {
  enviarNotificación({
    titulo: 'Puntaje en Alerta',
    mensaje: `${puntajeActual.tp_nombres} ${puntajeActual.tp_apellidos} bajó a ${puntajeActual.tp_nivel}`,
    accion: 'Revisar contrato'
  });
}
```

### Caso de Uso 3: Comparación de Candidatos
**Escenario:** Elegir entre varios candidatos

```javascript
const candidatos = ['1111111111', '2222222222', '3333333333'];

const resultados = await Promise.all(
  candidatos.map(doc => consultarPuntaje(doc))
);

const mejorCandidato = resultados.reduce((mejor, actual) => {
  return actual.tp_puntaje > mejor.tp_puntaje ? actual : mejor
});

console.log(`Mejor candidato: ${mejorCandidato.tp_nombres} - Puntaje: ${mejorCandidato.tp_puntaje}`);
```

### Caso de Uso 4: Exportar Reporte
**Escenario:** Crear reporte para archivo

```javascript
async function generarReporte(documento) {
  const datos = await consultarPuntaje(documento);
  
  const reporte = `
    === EVALUACIÓN DE ARRENDATARIO ===
    Fecha: ${new Date().toLocaleDateString()}
    
    Documento: ${datos.tp_no_documento}
    Nombre: ${datos.tp_nombres} ${datos.tp_apellidos}
    
    Puntaje: ${datos.tp_puntaje}/1000 (${datos.tp_porcentaje}%)
    Nivel: ${datos.tp_nivel}
    Evaluación: ${datos.mensaje_evaluacion}
    
    Recomendación: 
    ${generarRecomendacion(datos.tp_nivel)}
    
    Generated: Sistema de Referencias - ${new Date().toLocaleString()}
  `;
  
  return reporte;
}
```

---

## 📊 Respuestas Esperadas

### Estructura de Respuesta Exitosa

```typescript
interface RespuestaPuntaje {
  tp_no_documento: string;           // Documento del arrendatario
  tp_tipo_documento: string;         // Tipo (CC, TI, etc)
  tp_nombres: string;                // Nombre
  tp_apellidos: string;              // Apellido
  tp_direccion: string;              // Dirección
  tp_celular: string;                // Celular
  tp_puntaje: number;                // 0-1000
  tp_nivel: string;                  // EXCELENTE|BUENO|REGULAR|MALO|CRÍTICO
  tp_color: string;                  // Código hex (#rrggbb)
  tp_porcentaje: number;             // 0-100
  tp_valor_initial: number;          // Inicio del rango
  tp_valor_final: number;            // Fin del rango
  mensaje_evaluacion: string;        // Mensaje personalizado
}
```

### Estados HTTP Posibles

| Código | Meaning | Ejemplo |
|--------|---------|---------|
| 200 | Éxito | Datos retornados correctamente |
| 400 | Bad Request | Parámetro faltante |
| 401 | Unauthorized | Token inválido o expirado |
| 404 | Not Found | Persona no existe |
| 500 | Server Error | Error interno del servidor |

---

## ⚠️ Manejo de Errores

### Error 1: Documento No Encontrado
```javascript
try {
  const resultado = await consultarPuntaje('9999999999');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('La persona no está registrada en el sistema');
    // Mostrar opción de crear nuevo registro
  }
}
```

### Error 2: Sin Autenticación
```javascript
try {
  const resultado = await consultarPuntaje('1234567890');
} catch (error) {
  if (error.response?.status === 401) {
    console.log('Sesión expirada, redirigir a login');
    window.location.href = '/login';
  }
}
```

### Error 3: Validación
```javascript
function validarDocumento(documento) {
  if (!documento || documento.trim().length === 0) {
    throw new Error('Documento es requerido');
  }
  if (documento.length < 5) {
    throw new Error('Documento debe tener al menos 5 caracteres');
  }
  if (!/^\d+$/.test(documento)) {
    throw new Error('Documento debe contener solo números');
  }
  return true;
}

// Uso:
try {
  validarDocumento(document);
  const resultado = await consultarPuntaje(document);
} catch (error) {
  console.error('Validación fallida:', error.message);
}
```

---

## 🧪 Script de Prueba Completo

```javascript
// Copy & paste en consola del navegador (web devtools)

async function pruebaCompleta() {
  const token = localStorage.getItem('token');
  
  console.log('🔍 Iniciando prueba...');
  
  // Prueba 1: Documento válido
  console.log('\n📌 PRUEBA 1: Documento válido');
  try {
    const response = await fetch(
      'http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/?tp_no_documento=1234567890',
      {
        headers: { 'Authorization': `Token ${token}` }
      }
    );
    console.log('✅ Status:', response.status);
    const data = await response.json();
    console.log('✅ Datos:', data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Prueba 2: Documento inválido
  console.log('\n📌 PRUEBA 2: Documento inválido');
  try {
    const response = await fetch(
      'http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/?tp_no_documento=9999999999',
      {
        headers: { 'Authorization': `Token ${token}` }
      }
    );
    console.log('✅ Status:', response.status);
    const data = await response.json();
    console.log('❌ Error esperado:', data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n🎉 Prueba completa');
}

pruebaCompleta();
```

---

## 📦 Integración en Proyecto Existente

```javascript
// En un hook personalizado

export function usePuntajeArrendatario(token) {
  const [estado, setEstado] = useState({
    loading: false,
    error: null,
    datos: null
  });

  const consultar = async (documento) => {
    setEstado({ loading: true, error: null, datos: null });
    
    try {
      const response = await axios.get(
        'http://127.0.0.1:8000/referencias/api/consultar-puntaje/por_documento/',
        {
          params: { tp_no_documento: documento },
          headers: { 'Authorization': `Token ${token}` }
        }
      );
      
      setEstado({ loading: false, error: null, datos: response.data });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setEstado({ loading: false, error: errorMsg, datos: null });
      throw error;
    }
  };

  return { ...estado, consultar };
}

// Uso en componente:
function MiComponente() {
  const token = localStorage.getItem('token');
  const { loading, error, datos, consultar } = usePuntajeArrendatario(token);
  
  return (
    <div>
      <button onClick={() => consultar('1234567890')}>Consultar</button>
      {loading && <p>Cargando...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {datos && <MostrarResultado data={datos} />}
    </div>
  );
}
```

---

**Versión:** 1.0  
**Última actualización:** Marzo 2026
