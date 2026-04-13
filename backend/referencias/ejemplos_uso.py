"""
Ejemplos de uso de la función RECALCULOPUNTAJE

Este archivo muestra cómo usar los servicios de recálculo de puntaje
tanto a nivel de código Python como a través de las APIs REST.
"""

# ============================================================================
# USO EN PYTHON (Dentro del proyecto Django)
# ============================================================================
"""
from referencias.services import RecalculoPuntajeService, DetalleRecalculoService

# 1. Recalcular puntaje de UN ARRENDATARIO
resultado = RecalculoPuntajeService.recalcular_puntaje('1234567890')
print(resultado)
# Output:
# {
#     'success': True,
#     'TPNoDocumento': '1234567890',
#     'TPPuntaje': 850,
#     'mensaje': 'Puntaje actualizado a 850'
# }

# 2. Recalcular puntajes de todos los arrendatarios de UN CONTRATO
resultados = RecalculoPuntajeService.recalcular_puntaje_por_contrato(tca_id_contrato=5)
print(resultados)
# Output:
# [
#     {'success': True, 'TPNoDocumento': '1111111111', 'TPPuntaje': 920, 'mensaje': '...'},
#     {'success': True, 'TPNoDocumento': '2222222222', 'TPPuntaje': 750, 'mensaje': '...'},
# ]

# 3. Obtener detalles del cálculo (para debugging)
detalles = DetalleRecalculoService.obtener_detalles_calculo('1234567890')
print(detalles)
# Output:
# {
#     'TPNoDocumento': '1234567890',
#     'cantidad_reportes': 3,
#     'cantidad_score': 60,
#     'cantidad_ponderado': 15.0,
#     'tipo_promedio_peso': 76.67,
#     'tipo_ponderado': 23.0,
#     'tipo_detalles': [
#         {'tipo': 'AR', 'peso': 80},
#         {'tipo': 'SE', 'peso': 60},
#         {'tipo': 'AR', 'peso': 90}
#     ],
#     'valor_total_adeudado': 450000.00,
#     'valor_score': 40,
#     'valor_ponderado': 12.0,
#     'recencia_promedio': 75.0,
#     'recencia_ponderado': 11.25,
#     'recencia_detalles': [
#         {'fecha': '2025-01-15T10:30:00Z', 'dias_atras': 73, 'score': 80},
#         {'fecha': '2024-11-20T14:22:00Z', 'dias_atras': 129, 'score': 80},
#         {'fecha': '2024-08-10T09:15:00Z', 'dias_atras': 231, 'score': 60}
#     ],
#     'penalizacion_total': 61.25,
#     'puntaje_final': 387
# }
"""

# ============================================================================
# ENDPOINTS REST API
# ============================================================================

"""
BASE_URL = 'http://localhost:8000/api'

AUTENTICACIÓN:
Token: "your-auth-token"  (Requerido para todos los endpoints)
Headers: {
    "Authorization": "Token your-auth-token",
    "Content-Type": "application/json"
}

---

1. RECALCULAR PUNTAJE DE UN ARRENDATARIO
POST /api/historial/recalcular_puntaje/

Request Body:
{
    "tp_no_documento": "1234567890"
}

Response (200 OK):
{
    "success": true,
    "TPNoDocumento": "1234567890",
    "TPPuntaje": 850,
    "mensaje": "Puntaje actualizado a 850"
}

Response (404 Not Found):
{
    "success": false,
    "error": "Persona con documento 1234567890 no existe",
    "TPNoDocumento": "1234567890"
}

---

2. RECALCULAR PUNTAJES POR CONTRATO
POST /api/historial/recalcular_por_contrato/

Request Body:
{
    "tca_id_contrato": 5
}

Response (200 OK):
{
    "tca_id_contrato": 5,
    "cantidad_procesados": 2,
    "resultados": [
        {
            "success": true,
            "TPNoDocumento": "1111111111",
            "TPPuntaje": 920,
            "mensaje": "Puntaje actualizado a 920"
        },
        {
            "success": true,
            "TPNoDocumento": "2222222222",
            "TPPuntaje": 750,
            "mensaje": "Puntaje actualizado a 750"
        }
    ]
}

---

3. OBTENER DETALLES DEL CÁLCULO (Debugging)
GET /api/historial/detalles_calculo/?tp_no_documento=1234567890

Response (200 OK):
{
    "TPNoDocumento": "1234567890",
    "cantidad_reportes": 3,
    "cantidad_score": 60,
    "cantidad_ponderado": 15.0,
    "tipo_promedio_peso": 76.67,
    "tipo_ponderado": 23.0,
    "tipo_detalles": [
        {"tipo": "AR", "peso": 80},
        {"tipo": "SE", "peso": 60},
        {"tipo": "AR", "peso": 90}
    ],
    "valor_total_adeudado": 450000.00,
    "valor_score": 40,
    "valor_ponderado": 12.0,
    "recencia_promedio": 75.0,
    "recencia_ponderado": 11.25,
    "recencia_detalles": [
        {"fecha": "2025-01-15T10:30:00Z", "dias_atras": 73, "score": 80},
        {"fecha": "2024-11-20T14:22:00Z", "dias_atras": 129, "score": 80},
        {"fecha": "2024-08-10T09:15:00Z", "dias_atras": 231, "score": 60}
    ],
    "penalizacion_total": 61.25,
    "puntaje_final": 387
}

---

4. CREAR REPORTE (Se recalcula auto)
POST /api/historial/

Request Body:
{
    "TCAIDContrato": 5,
    "TRHTipoReporte": "AR",
    "TRHValorAdeudado": 450000.00,
    "TRHValorPagado": 0,
    "TRHSaldo": 450000.00,
    "TRHEstado": "ABIERTO",
    "TRHObservacion": "Retraso en el pago del arrendamiento"
}

Response (201 Created):
{
    "TRHId": 145,
    "TCAIDContrato": 5,
    "TCAIDContrato_info": {...},
    "TRHTipoReporte": "AR",
    "TRHTipoReporte_nombre": "Atraso en Renta",
    "TRHValorAdeudado": "450000.00",
    "TRHObservacion": "Retraso en el pago del arrendamiento",
    "TRHFechaReporte": "2025-03-29T14:30:00Z",
    "TUUserName": "admin"
}

Nota: Después de crear el reporte, el sistema automáticamente recalcula
los puntajes de todos los arrendatarios del contrato.
"""

# ============================================================================
# EJEMPLO CON CURL
# ============================================================================

"""
# 1. Autenticarse y obtener token
curl -X POST http://localhost:8000/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Response:
# {"token":"abc123def456..."}


# 2. Recalcular puntaje de un arrendatario
curl -X POST http://localhost:8000/api/historial/recalcular_puntaje/ \
  -H "Authorization: Token abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"tp_no_documento": "1234567890"}'


# 3. Obtener detalles del cálculo
curl -X GET "http://localhost:8000/api/historial/detalles_calculo/?tp_no_documento=1234567890" \
  -H "Authorization: Token abc123def456..."


# 4. Recalcular por contrato
curl -X POST http://localhost:8000/api/historial/recalcular_por_contrato/ \
  -H "Authorization: Token abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"tca_id_contrato": 5}'
"""

# ============================================================================
# EJEMPLO CLIENT JAVASCRIPT
# ============================================================================

"""
// Autenticación
async function authenticate(username, password) {
    const response = await fetch('http://localhost:8000/api-token-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    return data.token;
}

// Recalcular puntaje
async function recalcularPuntaje(token, tpNoDocumento) {
    const response = await fetch('http://localhost:8000/api/historial/recalcular_puntaje/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tp_no_documento: tpNoDocumento })
    });
    return response.json();
}

// Obtener detalles
async function obtenerDetalles(token, tpNoDocumento) {
    const response = await fetch(
        `http://localhost:8000/api/historial/detalles_calculo/?tp_no_documento=${tpNoDocumento}`,
        {
            headers: { 'Authorization': `Token ${token}` }
        }
    );
    return response.json();
}

// Uso
(async () => {
    const token = await authenticate('admin', 'password');
    const resultado = await recalcularPuntaje(token, '1234567890');
    console.log('Puntaje recalculado:', resultado);
    
    const detalles = await obtenerDetalles(token, '1234567890');
    console.log('Detalles del cálculo:', detalles);
})();
"""

# ============================================================================
# INTEGRACIÓN AUTOMÁTICA - FLUJO COMPLETO
# ============================================================================

"""
FLUJO AUTOMÁTICO cuando se crea un reporte:

1. Usuario crea un reporte a través de la API:
   POST /api/historial/

2. El método perform_create() en THistorialViewSet:
   - Guarda el reporte con el username del usuario actual
   - Llama a _recalcular_puntajes_arrendatarios(contrato_id)

3. RecalculoPuntajeService.recalcular_puntaje_por_contrato():
   - Obtiene todos los arrendatarios del contrato
   - Para cada arrendatario, llama a recalcular_puntaje()

4. RecalculoPuntajeService.recalcular_puntaje():
   - Calcula el nuevo puntaje usando calcular_nuevo_puntaje()
   - Actualiza el campo TPPuntaje en la tabla TPersonas
   - Retorna el resultado

5. El cliente recibe la confirmación de creación del reporte
   y los puntajes ya están actualizados en la base de datos.

VENTAJAS:
- Automático: No requiere intervención manual
- Transaccional: Se ejecuta en el mismo contexto de la solicitud
- Seguro: Valida las personas antes de actualizar
- Auditado: El username del usuario que creó el reporte se guarda
"""

# ============================================================================
# TESTING
# ============================================================================

"""
from django.test import TestCase
from referencias.services import RecalculoPuntajeService, DetalleRecalculoService
from personas.models import Persona
from referencias.models import THistorial
from tablas_maestras.models import TTipoReporte
from contrato.models import ContratoArriendo, ContratoArriendoRelacion
from datetime import datetime, timedelta

class TestRecalculoPuntaje(TestCase):
    
    def setUp(self):
        # Crear datos de prueba
        self.persona = Persona.objects.create(
            TPTipoDocumento='CC',
            TPNoDocumento='1234567890',
            TPNombres='Juan',
            TPApellidos='Pérez',
            TPDireccionResidencia='Calle 1',
            TPCelular1='3001234567',
            TEId='001',
            TCId='001',
            TPBarriosZona='Centro',
            TPPuntaje=1000
        )
        
        self.tipo_reporte_ar = TTipoReporte.objects.create(
            TRHTipoReporte='AR',
            TRDescripcion='Atraso en Renta',
            TRPeso=80
        )
        
        self.contrato = ContratoArriendo.objects.create(
            TBNoMatricula='100001',
            TBDireccion='Calle 1 #100',
            TCAFechaContrato=datetime.now().date(),
            TCAFechaInicioContrato=datetime.now().date(),
            TCADuracionContrato=12,
            TCATipoDuracion='MM',
            TCAValorCanonContrato=1000000
        )
        
        self.relacion = ContratoArriendoRelacion.objects.create(
            TCAIDContrato=self.contrato,
            TPNoDocumento='1234567890',
            TCARTipoParticipacion='ARRENDATARIO'
        )
        
        self.reporte = THistorial.objects.create(
            TCAIDContrato=self.contrato,
            TRHTipoReporte=self.tipo_reporte_ar,
            TRHValorAdeudado=500000,
            TRHValorPagado=0,
            TRHSaldo=500000,
            TRHEstado='ABIERTO',
            TRHFechaReporte=datetime.now()
        )
    
    def test_recalcular_puntaje(self):
        resultado = RecalculoPuntajeService.recalcular_puntaje('1234567890')
        self.assertTrue(resultado['success'])
        self.assertNotEqual(resultado['TPPuntaje'], 1000)  # Debe cambiar
        
        # Verificar que se actualizó en BD
        persona = Persona.objects.get(TPNoDocumento='1234567890')
        self.assertEqual(persona.TPPuntaje, resultado['TPPuntaje'])
    
    def test_detalles_calculo(self):
        detalles = DetalleRecalculoService.obtener_detalles_calculo('1234567890')
        self.assertEqual(detalles['cantidad_reportes'], 1)
        self.assertGreater(detalles['puntaje_final'], 0)
        self.assertLess(detalles['puntaje_final'], 1000)
"""
