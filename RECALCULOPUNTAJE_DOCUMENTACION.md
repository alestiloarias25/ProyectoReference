# RECALCULOPUNTAJE - Documentación Técnica

## Resumen General

La función **RECALCULOPUNTAJE** es un sistema automatizado que recalcula el puntaje crediticio de arrendatarios basado en su historial de reportes de incumplimiento. Se ejecuta automáticamente cuando se ingresa un nuevo reporte en la tabla `THistorial`.

## Fórmula de Cálculo

```
TPPuntaje = 1000 – (PenalizaciónTotal × 10)

Donde:
PenalizaciónTotal = (CantidadReportes × 0.25) + (TipoReporte × 0.30) + 
                   (ValorAdeudado × 0.30) + (Recencia × 0.15)
```

## Componentes de la Penalización

### 1. CantidadReportes (25% del peso)

Puntuación según cantidad de reportes abiertos:

| Cantidad | Score |
|----------|-------|
| 0        | 0     |
| 1        | 20    |
| 2        | 40    |
| 3        | 60    |
| 4        | 80    |
| 5+       | 100   |

**Código Python:**
```python
@staticmethod
def get_cantidad_reportes_score(cantidad):
    if cantidad == 0: return 0
    elif cantidad == 1: return 20
    elif cantidad == 2: return 40
    elif cantidad == 3: return 60
    elif cantidad == 4: return 80
    else: return 100
```

### 2. TipoReporte (30% del peso)

Pesos asignados a cada tipo de reporte:

| Tipo | Descripción           | Peso |
|------|----------------------|------|
| OC   | Otros Compromisos     | 100  |
| AR   | Atraso en Renta       | 80   |
| SE   | Servicio de Energía   | 60   |
| DA   | Daño al Inmueble      | 50   |
| US   | Uso Indebido          | 30   |

Se **promedian** los pesos de todos los reportes del arrendatario.

**Nota:** Los pesos se pueden personalizar en el campo `TRPeso` de la tabla `TTipoReporte`.

### 3. ValorAdeudado (30% del peso)

Puntuación según monto total adeudado:

| Rango                    | Score |
|--------------------------|-------|
| $0                      | 0     |
| $1 - $300,000           | 20    |
| $300,001 - $700,000     | 40    |
| $700,001 - $1,000,000   | 60    |
| $1,000,001 - $1,400,000 | 80    |
| $1,400,001+             | 100   |

Se **suman** todos los valores adeudados del arrendatario.

### 4. Recencia (15% del peso)

Puntuación según antigüedad de los reportes:

| Rango            | Score |
|------------------|-------|
| < 3 meses        | 100   |
| 3 a 6 meses      | 80    |
| 6 a 12 meses     | 60    |
| 12 a 24 meses    | 30    |
| 24+ meses        | 10    |

Se **promedian** los scores de recencia de todos los reportes.

## Arquitectura del Sistema

### Archivos Principales

1. **referencias/services.py** - Lógica de negocio
   - `RecalculoPuntajeService`: Clase principal con métodos de cálculo
   - `DetalleRecalculoService`: Obtiene detalles para debugging

2. **referencias/views.py** - Endpoints REST
   - `THistorialViewSet`: Viewset para THistorial con endpoints personalizados
   - `perform_create()`: Dispara recálculo automático

3. **referencias/models.py** - Modelos Django
   - `TTipoReporte`: Define tipos de reportes y sus pesos
   - `THistorial`: Registra reportes de incumplimiento

4. **referencias/queries_sql.py** - Referencias SQL
5. **referencias/ejemplos_uso.py** - Ejemplos y tests

### Flujo de Ejecución

```
1. Usuario crea un reporte (POST /api/historial/)
   ↓
2. perform_create() guarda el reporte
   ↓
3. _recalcular_puntajes_arrendatarios(tca_id_contrato) se dispara
   ↓
4. RecalculoPuntajeService.recalcular_puntaje_por_contrato()
   ↓
5. Para cada arrendatario:
   - recalcular_puntaje(tp_no_documento)
   - calcular_nuevo_puntaje()
   - Actualizar TPPuntaje en Persona
   ↓
6. Retornar resultados
```

## APIs REST

### Autenticación

Todos los endpoints requieren token de autenticación:

```
Headers:
Authorization: Token <token>
Content-Type: application/json
```

### 1. Recalcular Puntaje Individual

**Endpoint:** `POST /api/historial/recalcular_puntaje/`

**Request:**
```json
{
    "tp_no_documento": "1234567890"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "TPNoDocumento": "1234567890",
    "TPPuntaje": 850,
    "mensaje": "Puntaje actualizado a 850"
}
```

**Response (404):**
```json
{
    "success": false,
    "error": "Persona con documento 1234567890 no existe",
    "TPNoDocumento": "1234567890"
}
```

### 2. Recalcular por Contrato

**Endpoint:** `POST /api/historial/recalcular_por_contrato/`

**Request:**
```json
{
    "tca_id_contrato": 5
}
```

**Response (200 OK):**
```json
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
```

### 3. Obtener Detalles del Cálculo

**Endpoint:** `GET /api/historial/detalles_calculo/?tp_no_documento=1234567890`

**Response (200 OK):**
```json
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
        {
            "fecha": "2025-01-15T10:30:00Z",
            "dias_atras": 73,
            "score": 80
        }
    ],
    "penalizacion_total": 61.25,
    "puntaje_final": 387
}
```

### 4. Crear Reporte (Dispara Recálculo Automático)

**Endpoint:** `POST /api/historial/`

**Request:**
```json
{
    "TCAIDContrato": 5,
    "TRHTipoReporte": "AR",
    "TRHValorAdeudado": 450000.00,
    "TRHValorPagado": 0,
    "TRHSaldo": 450000.00,
    "TRHEstado": "ABIERTO",
    "TRHObservacion": "Retraso en pago de canon"
}
```

**Response (201 Created):**
```json
{
    "TRHId": 145,
    "TCAIDContrato": 5,
    "TRHTipoReporte": "AR",
    "TRHTipoReporte_nombre": "Atraso en Renta",
    "TRHFechaReporte": "2025-03-29T14:30:00Z",
    "TUUserName": "admin"
}
```

**Nota:** Después de crear el reporte, el sistema automáticamente recalcula los puntajes.

## Método Python Directo

```python
from referencias.services import RecalculoPuntajeService, DetalleRecalculoService

# Recalcular un arrendatario
resultado = RecalculoPuntajeService.recalcular_puntaje('1234567890')

# Recalcular todos los arrendatarios de un contrato
resultados = RecalculoPuntajeService.recalcular_puntaje_por_contrato(5)

# Obtener detalles del cálculo
detalles = DetalleRecalculoService.obtener_detalles_calculo('1234567890')
```

## Ejemplo Completo de Cálculo

**Datos de entrada:**
- Arrendatario: 1234567890
- Cantidad de reportes: 3
- Tipos de reporte: AR (peso 80), SE (peso 60), AR (peso 80)
- Valores adeudados: $200,000 + $300,000 + $500,000 = $1,000,000 total
- Fechas: 60 días atrás, 120 días atrás, 200 días atrás

**Cálculos:**

1. **CantidadReportes (3 reportes):**
   - Score: 60
   - Ponderado: (60 / 100) × 0.25 = 15.0

2. **TipoReporte (Promedio de pesos):**
   - Promedio: (80 + 60 + 80) / 3 = 73.33
   - Ponderado: (73.33 / 100) × 0.30 = 22.0

3. **ValorAdeudado ($1,000,000):**
   - Score: 60 (rango $700k-$1M)
   - Ponderado: (60 / 100) × 0.30 = 18.0

4. **Recencia (Promedio de días):**
   - Scores: 100 (< 90 días), 80 (90-180), 60 (180-365)
   - Promedio: (100 + 80 + 60) / 3 = 80.0
   - Ponderado: (80 / 100) × 0.15 = 12.0

5. **Penalización Total:**
   - 15.0 + 22.0 + 18.0 + 12.0 = 67.0

6. **Puntaje Final:**
   - TPPuntaje = 1000 - (67.0 × 10) = 1000 - 670 = **330**

## Consideraciones de Diseño

### ✅ Ventajas

1. **Automático:** Se ejecuta sin intervención manual
2. **Consistente:** Los cálculos utilizan la misma lógica siempre
3. **Auditable:** Se registra al usuario que creó el reporte
4. **Flexible:** Los pesos pueden personalizarse por tipo de reporte
5. **Robusto:** Valida existencia de personas antes de actualizar
6. **Seguro:** Usa transacciones de Django

### ⚙️ Configuraciones

Para personalizar el sistema:

1. **Cambiar pesos de tipos de reporte:**
   - Editar el campo `TRPeso` en la tabla `TTipoReporte`

2. **Cambiar ponderaciones (25%, 30%, 30%, 15%):**
   - Modificar en `calcular_penalizacion_total()` en `services.py`

3. **Cambiar rangos de valores y scores:**
   - Modificar las funciones `get_*_score()` en `services.py`

## Monitoreo y Debugging

### Usando el Endpoint de Detalles

```bash
curl -X GET \
  "http://localhost:8000/api/historial/detalles_calculo/?tp_no_documento=1234567890" \
  -H "Authorization: Token abc123..."
```

Esto retorna un desglose completo del cálculo útil para auditoría.

### Validación de Integridad SQL

```sql
-- Verificar arrendatarios con puntaje inconsistente
SELECT 
    tp.TPNoDocumento,
    tp.TPPuntaje,
    COUNT(th.TRHId) as cantidad_reportes
FROM tpersonas tp
LEFT JOIN tcontratoarriendo_relacion car ON tp.TPNoDocumento = car.TPNoDocumento
LEFT JOIN thistorial th ON car.TCAIDContrato = th.TCAIDContrato
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
GROUP BY tp.TPNoDocumento, tp.TPPuntaje
HAVING (COUNT(th.TRHId) > 0 AND tp.TPPuntaje = 1000) 
   OR (COUNT(th.TRHId) = 0 AND tp.TPPuntaje != 1000);
```

## Limitaciones y Consideraciones

1. **No afecta interfaces existentes:** El campo TPPuntaje se actualiza solo, interfaces no necesitan cambios
2. **Reportes anulados:** No excluye reportes por estado, considera todos

## Mantenimiento

### Recalcular Todos los Puntajes (Batch)

Para recalcular todos los puntajes (útil después de cambiar la fórmula):

```python
from referencias.models import THistorial
from referencias.services import RecalculoPuntajeService
from personas.models import Persona

# Recalcular todos
for persona in Persona.objects.all():
    try:
        RecalculoPuntajeService.recalcular_puntaje(persona.TPNoDocumento)
    except Exception as e:
        print(f"Error con {persona.TPNoDocumento}: {e}")
```

## Conclusión

El sistema RECALCULOPUNTAJE proporciona una forma automática, consistente y auditada de calcular puntajes crediticios basados en el historial de reportes de incumplimiento, sin afectar las interfaces o formularios existentes.
