# TPuntajeColor - Configuración de Colores por Puntaje

## 📋 Descripción

La tabla `TPuntajeColor` permite configurar rangos de colores para diferentes niveles de puntaje de arrendatarios. Esta configuración se puede usar en interfaces frontend para mostrar visualmente el estado crediticio de los arrendatarios.

## 🗂️ Estructura de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `TPCNivel` | `CharField(50)` | **PK** - Nivel descriptivo (EXCELENTE, BUENO, etc.) |
| `TPCValorInicial` | `IntegerField` | Valor inicial del rango de puntaje |
| `TPCValorFinal` | `IntegerField` | Valor final del rango de puntaje |
| `TPCColor` | `CharField(50)` | Código de color (hex: #FF0000) o nombre |

## 📊 Rangos de Ejemplo

| Nivel | Rango | Color | Descripción |
|-------|-------|-------|-------------|
| EXCELENTE | 900-1000 | 🟢 `#28a745` | Puntaje excelente |
| BUENO | 700-899 | 🔵 `#17a2b8` | Puntaje bueno |
| REGULAR | 500-699 | 🟡 `#ffc107` | Puntaje regular |
| MALO | 300-499 | 🟠 `#fd7e14` | Puntaje malo |
| CRÍTICO | 0-299 | 🔴 `#dc3545` | Puntaje crítico |

## 🔗 APIs REST

### Base URL
```
http://localhost:8000/api/puntajecolor/
```

### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/puntajecolor/` | Listar todos los rangos |
| `POST` | `/api/puntajecolor/` | Crear nuevo rango |
| `GET` | `/api/puntajecolor/{TPCNivel}/` | Obtener rango específico |
| `PUT` | `/api/puntajecolor/{TPCNivel}/` | Actualizar rango |
| `DELETE` | `/api/puntajecolor/{TPCNivel}/` | Eliminar rango |

### Ejemplos de Uso

#### 1. Listar Rangos
```bash
GET /api/puntajecolor/
Authorization: Token <token>
```

**Response:**
```json
[
    {
        "TPCNivel": "EXCELENTE",
        "TPCValorInicial": 900,
        "TPCValorFinal": 1000,
        "TPCColor": "#28a745"
    },
    {
        "TPCNivel": "BUENO",
        "TPCValorInicial": 700,
        "TPCValorFinal": 899,
        "TPCColor": "#17a2b8"
    }
]
```

#### 2. Crear Nuevo Rango
```bash
POST /api/puntajecolor/
Authorization: Token <token>
Content-Type: application/json

{
    "TPCNivel": "MUY_BUENO",
    "TPCValorInicial": 800,
    "TPCValorFinal": 899,
    "TPCColor": "#20c997"
}
```

#### 3. Actualizar Rango
```bash
PUT /api/puntajecolor/EXCELENTE/
Authorization: Token <token>
Content-Type: application/json

{
    "TPCNivel": "EXCELENTE",
    "TPCValorInicial": 950,
    "TPCValorFinal": 1000,
    "TPCColor": "#28a745"
}
```

## 🛡️ Validaciones

### Validaciones Automáticas

1. **Rangos no solapados:** No se permiten rangos que se superpongan
2. **Valor inicial < final:** El valor inicial debe ser menor que el final
3. **PK única:** TPCNivel debe ser único

### Ejemplos de Errores

**Rango solapado:**
```json
{
    "error": "El rango se solapa con el nivel 'BUENO' (700-899)"
}
```

**Valor inicial >= final:**
```json
{
    "error": "El valor inicial debe ser menor que el valor final"
}
```

## 📝 Uso en Código Python

### Consultar Color por Puntaje

```python
from referencias.models import TPuntajeColor

def obtener_color_por_puntaje(puntaje):
    """
    Retorna el color correspondiente a un puntaje
    """
    try:
        rango = TPuntajeColor.objects.filter(
            TPCValorInicial__lte=puntaje,
            TPCValorFinal__gte=puntaje
        ).first()
        
        if rango:
            return {
                'nivel': rango.TPCNivel,
                'color': rango.TPCColor,
                'rango': f"{rango.TPCValorInicial}-{rango.TPCValorFinal}"
            }
        else:
            return None
    except Exception as e:
        print(f"Error obteniendo color: {e}")
        return None

# Uso
color_info = obtener_color_por_puntaje(850)
if color_info:
    print(f"Puntaje 850: {color_info['nivel']} - {color_info['color']}")
```

### Integración con RECALCULOPUNTAJE

```python
from referencias.services import RecalculoPuntajeService
from referencias.models import TPuntajeColor

def recalcular_con_color(tp_no_documento):
    """
    Recalcula puntaje y retorna información con color
    """
    # Recalcular puntaje
    resultado = RecalculoPuntajeService.recalcular_puntaje(tp_no_documento)
    
    if resultado['success']:
        # Obtener color
        color_info = obtener_color_por_puntaje(resultado['TPPuntaje'])
        
        return {
            **resultado,
            'color_info': color_info
        }
    
    return resultado
```

## 🚀 Instalación y Configuración

### 1. Aplicar Migración
```bash
python manage.py migrate referencias
```

### 2. Poblar Datos Iniciales
```bash
python manage.py shell < poblar_puntaje_color.py
```

### 3. Verificar Instalación
```bash
# Verificar que la tabla existe
python manage.py dbshell
.schema tpuntajecolor

# Verificar datos
python manage.py shell
from referencias.models import TPuntajeColor
print(TPuntajeColor.objects.all())
```

## 🎨 Uso en Frontend

### JavaScript - Obtener Color
```javascript
async function obtenerColorPuntaje(puntaje) {
    try {
        const response = await fetch('/api/puntajecolor/');
        const rangos = await response.json();
        
        const rango = rangos.find(r => 
            puntaje >= r.TPCValorInicial && 
            puntaje <= r.TPCValorFinal
        );
        
        return rango ? {
            nivel: rango.TPCNivel,
            color: rango.TPCColor
        } : null;
    } catch (error) {
        console.error('Error obteniendo color:', error);
        return null;
    }
}

// Uso
const color = await obtenerColorPuntaje(850);
if (color) {
    document.getElementById('puntaje').style.color = color.color;
    document.getElementById('nivel').textContent = color.nivel;
}
```

### CSS - Estilos Dinámicos
```javascript
function aplicarEstiloPuntaje(elemento, puntaje) {
    obtenerColorPuntaje(puntaje).then(color => {
        if (color) {
            elemento.style.backgroundColor = color.color;
            elemento.classList.add(`puntaje-${color.nivel.toLowerCase()}`);
        }
    });
}
```

## 📊 Consultas Útiles

### Ver Todos los Rangos Ordenados
```sql
SELECT * FROM tpuntajecolor ORDER BY TPCValorInicial DESC;
```

### Verificar Solapamientos
```sql
SELECT a.TPCNivel, b.TPCNivel,
       a.TPCValorInicial, a.TPCValorFinal,
       b.TPCValorInicial, b.TPCValorFinal
FROM tpuntajecolor a, tpuntajecolor b
WHERE a.TPCNivel < b.TPCNivel
  AND a.TPCValorInicial <= b.TPCValorFinal
  AND a.TPCValorFinal >= b.TPCValorInicial;
```

### Rangos Continuos
```sql
SELECT 
    TPCNivel,
    TPCValorInicial,
    TPCValorFinal,
    TPCValorFinal - TPCValorInicial + 1 as amplitud
FROM tpuntajecolor
ORDER BY TPCValorInicial;
```

## 🔧 Mantenimiento

### Agregar Nuevo Rango
1. Verificar que no se solape con rangos existentes
2. Usar API POST o admin de Django
3. Probar con diferentes valores de puntaje

### Modificar Rangos
1. Considerar impacto en datos existentes
2. Actualizar via API PUT
3. Verificar que no queden "huecos" en la escala

### Backup de Configuración
```bash
python manage.py dumpdata referencias.TPuntajeColor --output=config_colores.json
```

## ⚠️ Consideraciones

1. **Rangos continuos:** Idealmente los rangos deben cubrir toda la escala (0-1000)
2. **No solapamientos:** Los rangos no deben superponerse
3. **Colores accesibles:** Elegir colores que sean distinguibles para personas con daltonismo
4. **Cache:** Considerar cachear esta configuración si se consulta frecuentemente

## 📞 Soporte

Para problemas con TPuntajeColor:
1. Verificar logs: `python manage.py tail`
2. Validar datos: `TPuntajeColor.objects.all()`
3. Probar APIs: Usar Postman/Insomnia
4. Revisar validaciones en serializer