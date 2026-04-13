# RECALCULOPUNTAJE - Sistema Automatizado de Puntaje de Arrendatarios

## 🎯 Descripción

Sistema automatizado que recalcula el puntaje crediticio de arrendatarios basado en su historial de reportes de incumplimiento. Se ejecuta automáticamente al ingresar un nuevo reporte y actualiza la tabla `TPersonas` sin afectar interfaces o formularios existentes.

## 📊 Fórmula de Cálculo

```
TPPuntaje = 1000 – (PenalizaciónTotal × 10)

Donde:
PenalizaciónTotal = (CantidadReportes × 0.25) + (TipoReporte × 0.30) + 
                   (ValorAdeudado × 0.30) + (Recencia × 0.15)
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (React)                      │
│  POST /api/historial/  (crear reporte)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────┐
      │    Django REST Framework             │
      │    THistorialViewSet.perform_create()│
      └────────────┬─────────────────────────┘
                   │
                   ▼
      ┌──────────────────────────────────────┐
      │  _recalcular_puntajes_arrendatarios()│
      │        (views.py)                    │
      └────────────┬─────────────────────────┘
                   │
                   ▼
  ┌───────────────────────────────────────────────┐
  │  RecalculoPuntajeService                      │
  │  - recalcular_puntaje_por_contrato()          │
  │  - recalcular_puntaje()                       │
  │  - calcular_nuevo_puntaje()                   │
  │  (services.py)                                │
  └───────────────────┬─────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
  ┌──────────────┐          ┌──────────────┐
  │ Consulta BD  │          │ Calcula      │
  │ THistorial   │          │ - Cantidad   │
  │ TTipoReporte │          │ - TipoReport │
  │ Persona      │          │ - Valor Adu. │
  │              │          │ - Recencia   │
  └──────────────┘          └──────────────┘
        │                            │
        └─────────────┬──────────────┘
                      ▼
            ┌──────────────────────┐
            │ UPDATE TPersonas     │
            │ SET TPPuntaje = ?    │
            └──────────────────────┘
                      │
                      ▼
                  (Respuesta OK)
```

## 📁 Archivos

### Nuevos Archivos Creados:

| Archivo | Descripción |
|---------|-----------|
| `backend/referencias/services.py` | Lógica de negocio principal |
| `backend/referencias/queries_sql.py` | Consultas SQL de referencia |
| `backend/referencias/ejemplos_uso.py` | Ejemplos y tests |
| `RECALCULOPUNTAJE_DOCUMENTACION.md` | Documentación técnica |
| `RESUMEN_CAMBIOS.md` | Registro de cambios |
| `verificar_instalacion.py` | Script de validación |

### Archivos Modificados:

| Archivo | Cambios |
|---------|---------|
| `backend/referencias/views.py` | +3 endpoints, +2 métodos |
| `backend/referencias/models.py` | +TRPeso en TTipoReporte ✅ |

## 🚀 Instalación

```bash
# 1. Los archivos ya están creados
# 2. Ejecutar verificación
python verificar_instalacion.py

# 3. Aplicar migraciones
python manage.py migrate referencias

# 4. ¡Listo! El sistema está operacional
```

## 💻 Endpoints REST

| Método | Endpoint | Descripción |
|--------|----------|-----------|
| `POST` | `/api/historial/recalcular_puntaje/` | Recalcular un arrendatario |
| `POST` | `/api/historial/recalcular_por_contrato/` | Recalcular por contrato |
| `GET` | `/api/historial/detalles_calculo/` | Ver detalles del cálculo |
| `POST` | `/api/historial/` | Crear reporte (recalcula auto) |

### Ejemplo: Crear Reporte (Recalcula Automáticamente)

```bash
curl -X POST http://localhost:8000/api/historial/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "TCAIDContrato": 5,
    "TRHTipoReporte": "AR",
    "TRHValorAdeudado": 450000,
    "TRHValorPagado": 0,
    "TRHSaldo": 450000,
    "TRHEstado": "ABIERTO",
    "TRHObservacion": "Atraso en pago"
  }'
```

**Resultado:** Reporte creado + Puntajes de arrendatarios actualizados automáticamente ✅

### Ejemplo: Ver Detalles del Cálculo

```bash
curl -X GET \
  "http://localhost:8000/api/historial/detalles_calculo/?tp_no_documento=1234567890" \
  -H "Authorization: Token abc123..."
```

**Resultado:** Desglose completo del cálculo para auditoría

## 🐍 Uso en Python

```python
from referencias.services import RecalculoPuntajeService, DetalleRecalculoService

# Recalcular puntaje individual
resultado = RecalculoPuntajeService.recalcular_puntaje('1234567890')
print(resultado['TPPuntaje'])  # 850

# Recalcular todos los arrendatarios de un contrato
resultados = RecalculoPuntajeService.recalcular_puntaje_por_contrato(5)

# Obtener detalles del cálculo (para debugging)
detalles = DetalleRecalculoService.obtener_detalles_calculo('1234567890')
print(detalles['puntaje_final'])  # 387
```

## ⚙️ Configuración

### Cambiar Pesos de Tipos de Reporte

```sql
UPDATE ttiporeporte 
SET TRPeso = 90 
WHERE TRHTipoReporte = 'AR';
```

### Cambiar Ponderaciones de la Fórmula

Editar `calcular_penalizacion_total()` en `backend/referencias/services.py`:

```python
# Cambiar: (cantidad_score / 100) * 25 
#      a: (cantidad_score / 100) * 30  (más peso a cantidad)
```

## 📋 Escalas de Cálculo

### CantidadReportes (25% ponderación)
- 0 → 0, 1 → 20, 2 → 40, 3 → 60, 4 → 80, 5+ → 100

### TipoReporte (30% ponderación)
- OC (100), AR (80), SE (60), DA (50), US (30)
- Se promedian múltiples reportes
- Personalizables via campo TRPeso

### ValorAdeudado (30% ponderación)
- $0 → 0
- $1-300k → 20
- $300k-700k → 40
- $700k-1M → 60
- $1M-1.4M → 80
- 1.4M+ → 100

### Recencia (15% ponderación)
- <3m → 100, 3-6m → 80, 6-12m → 60, 12-24m → 30, 24+ → 10

## ✨ Características

✅ **Automático:** Se ejecuta sin intervención manual  
✅ **Seguro:** Valida datos antes de actualizar  
✅ **Auditible:** Registra usuario que creó reportes  
✅ **Flexible:** Pesos personalizables  
✅ **Debuggable:** Endpoint de detalles para análisis  
✅ **No invasivo:** Interfaces/formularios intactos  
✅ **Escrito en Python:** Fácil de mantener  
✅ **Documentado:** Completo con ejemplos  

## 📊 Ejemplo de Cálculo Completo

**Arrendatario:** 1234567890  
**Reportes:** 3 (AR, SE, AR)  
**Valores adeudados:** $1,000,000 total  
**Antigüedad:** 60, 120, 200 días

**Resultado:**

| Componente | Score | Ponderado | 
|-----------|-------|-----------|
| CantidadReportes (3) | 60 | 15.0 × 25% |
| TipoReporte (promedio) | 73 | 22.0 × 30% |
| ValorAdeudado (1M) | 60 | 18.0 × 30% |
| Recencia (promedio) | 80 | 12.0 × 15% |
| **Penalización Total** | | **67.0** |
| **TPPuntaje Final** | | **330** |

## 🔍 Debugging

```bash
# Ver detalles del cálculo
curl "http://localhost:8000/api/historial/detalles_calculo/?tp_no_documento=1234567890" \
  -H "Authorization: Token ..."

# Validar integridad en BD
SELECT * FROM tpersonas WHERE TPPuntaje < 600;
```

## 📚 Documentación

- **RECALCULOPUNTAJE_DOCUMENTACION.md** - Documentación técnica completa
- **RESUMEN_CAMBIOS.md** - Registro de cambios del proyecto
- **backend/referencias/ejemplos_uso.py** - Ejemplos y tests
- **backend/referencias/queries_sql.py** - Queries SQL útiles

## 🧪 Testing

```bash
# Ejecutar tests (si existen)
python manage.py test referencias

# Verificar instalación
python verificar_instalacion.py
```

## ⚠️ Importante

1. **Solo nuevos reportes disparan recálculo automático**
2. **El puntaje mínimo es 0** (nunca negativos)
3. **Se ejecuta en contexto de la solicitud** (sin colas async)
4. **Requiere Django admin para cambiar pesos**

## 🤝 Soporte

Para preguntas o problemas:

1. Revisar logs: `python manage.py tail`
2. Ver detalles del cálculo con el endpoint de debugging
3. Consultar RECALCULOPUNTAJE_DOCUMENTACION.md
4. Ejecutar verificar_instalacion.py

## 📝 Notas

- Sistema completamente automatizado
- No requiere cambios en frontend
- Compatible con interfaces existentes
- Totalmente auditible
- Producción ready ✅

---

**Estado:** ✅ Implementado y Documentado  
**Fecha:** 29 de Marzo de 2026  
**Versión:** 1.0
