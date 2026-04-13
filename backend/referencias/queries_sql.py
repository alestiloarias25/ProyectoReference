"""
QUERIES SQL para el cálculo de puntaje de arrendatarios

Estas queries pueden ser usadas directamente en la base de datos o como referencia
para debugging del sistema de recalcuilo de puntaje.
"""

# ============================================================================
# 1. OBTENER CANTIDAD DE REPORTES POR ARRENDATARIO
# ============================================================================
"""
SELECT 
    tp.TPNoDocumento,
    tp.TPNombres,
    tp.TPApellidos,
    COUNT(th.TRHId) as cantidad_reportes
FROM tpersonas tp
LEFT JOIN tcontratoarriendo_relacion car ON tp.TPNoDocumento = car.TPNoDocumento
LEFT JOIN thistorial th ON car.TCAIDContrato = th.TCAIDContrato
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
    AND th.TRHEstado = 'ABIERTO'
GROUP BY tp.TPNoDocumento, tp.TPNombres, tp.TPApellidos
ORDER BY cantidad_reportes DESC;
"""

# ============================================================================
# 2. OBTENER PROMEDIO DE PESO POR TIPO DE REPORTE
# ============================================================================
"""
SELECT 
    tp.TPNoDocumento,
    th.TRHTipoReporte,
    ttr.TRPeso,
    ttr.TRDescripcion,
    COUNT(*) as cantidad_reportes_tipo
FROM thistorial th
LEFT JOIN ttiporeporte ttr ON th.TRHTipoReporte = ttr.TRHTipoReporte
LEFT JOIN tcontratoarriendo_relacion car ON th.TCAIDContrato = car.TCAIDContrato
LEFT JOIN tpersonas tp ON car.TPNoDocumento = tp.TPNoDocumento
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
GROUP BY tp.TPNoDocumento, th.TRHTipoReporte, ttr.TRPeso, ttr.TRDescripcion
ORDER BY tp.TPNoDocumento, th.TRHTipoReporte;

-- Promedio de peso por arrendatario
SELECT 
    tp.TPNoDocumento,
    AVG(COALESCE(ttr.TRPeso, 50)) as peso_promedio
FROM thistorial th
LEFT JOIN ttiporeporte ttr ON th.TRHTipoReporte = ttr.TRHTipoReporte
LEFT JOIN tcontratoarriendo_relacion car ON th.TCAIDContrato = car.TCAIDContrato
LEFT JOIN tpersonas tp ON car.TPNoDocumento = tp.TPNoDocumento
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
GROUP BY tp.TPNoDocumento
ORDER BY tp.TPNoDocumento;
"""

# ============================================================================
# 3. OBTENER VALOR TOTAL ADEUDADO POR ARRENDATARIO
# ============================================================================
"""
SELECT 
    tp.TPNoDocumento,
    tp.TPNombres,
    tp.TPApellidos,
    SUM(th.TRHValorAdeudado) as valor_total_adeudado,
    COUNT(*) as cantidad_reportes
FROM thistorial th
LEFT JOIN tcontratoarriendo_relacion car ON th.TCAIDContrato = car.TCAIDContrato
LEFT JOIN tpersonas tp ON car.TPNoDocumento = tp.TPNoDocumento
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
    AND th.TRHValorAdeudado > 0
GROUP BY tp.TPNoDocumento, tp.TPNombres, tp.TPApellidos
ORDER BY valor_total_adeudado DESC;
"""

# ============================================================================
# 4. OBTENER RECENCIA DE REPORTES (DÍAS TRANSCURRIDOS)
# ============================================================================
"""
SELECT 
    tp.TPNoDocumento,
    th.TRHId,
    th.TRFechaReporte,
    DATEDIFF(DAY, th.TRFechaReporte, GETDATE()) as dias_transcurridos,
    CASE 
        WHEN DATEDIFF(DAY, th.TRFechaReporte, GETDATE()) < 90 THEN '(<3 meses)'
        WHEN DATEDIFF(DAY, th.TRFechaReporte, GETDATE()) < 180 THEN '(3-6 meses)'
        WHEN DATEDIFF(DAY, th.TRFechaReporte, GETDATE()) < 365 THEN '(6-12 meses)'
        WHEN DATEDIFF(DAY, th.TRFechaReporte, GETDATE()) < 730 THEN '(12-24 meses)'
        ELSE '(24+ meses)'
    END as rango_recencia
FROM thistorial th
LEFT JOIN tcontratoarriendo_relacion car ON th.TCAIDContrato = car.TCAIDContrato
LEFT JOIN tpersonas tp ON car.TPNoDocumento = tp.TPNoDocumento
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
ORDER BY tp.TPNoDocumento, th.TRFechaReporte DESC;
"""

# ============================================================================
# 5. CÁLCULO COMPLETO - VISTA CONSOLIDADA DE COMPONENTES
# ============================================================================
"""
-- Nota: Esta es una query conceptual. El cálculo real se realiza en Python
-- debido a la complejidad de las reglas de negocio.

SELECT 
    tp.TPNoDocumento,
    tp.TPNombres,
    tp.TPApellidos,
    COUNT(DISTINCT th.TRHId) as cantidad_reportes,
    SUM(th.TRHValorAdeudado) as valor_total_adeudado,
    AVG(CAST(COALESCE(ttr.TRPeso, 50) as FLOAT)) as peso_promedio,
    AVG(DATEDIFF(DAY, th.TRFechaReporte, GETDATE())) as dias_promedio_atras
FROM thistorial th
LEFT JOIN ttiporeporte ttr ON th.TRHTipoReporte = ttr.TRHTipoReporte
LEFT JOIN tcontratoarriendo_relacion car ON th.TCAIDContrato = car.TCAIDContrato
LEFT JOIN tpersonas tp ON car.TPNoDocumento = tp.TPNoDocumento
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
GROUP BY tp.TPNoDocumento, tp.TPNombres, tp.TPApellidos
ORDER BY tp.TPNoDocumento;
"""

# ============================================================================
# 6. ACTUALIZAR PUNTAJE EN LOTE (Post-Recálculo)
# ============================================================================
"""
-- Después de calcular los puntajes en Python, actualizar la tabla:

UPDATE tpersonas
SET TPPuntaje = @nuevo_puntaje
WHERE TPNoDocumento = @tp_no_documento;

-- Actualizar múltiples registros de forma segura:
UPDATE tpersonas
SET TPPuntaje = CASE
    WHEN TPNoDocumento = 'DOC1' THEN 950
    WHEN TPNoDocumento = 'DOC2' THEN 850
    WHEN TPNoDocumento = 'DOC3' THEN 1000
    ELSE TPPuntaje
END
WHERE TPNoDocumento IN ('DOC1', 'DOC2', 'DOC3');
"""

# ============================================================================
# 7. QUERY PARA VALIDAR INTEGRIDAD DE DATOS
# ============================================================================
"""
-- Verificar que todos los arrendatarios tienen puntaje calculado
SELECT 
    tp.TPNoDocumento,
    tp.TPNombres,
    tp.TPPuntaje,
    COUNT(th.TRHId) as cantidad_reportes,
    CASE 
        WHEN COUNT(th.TRHId) > 0 AND tp.TPPuntaje = 1000 THEN 'REVISAR - Tiene reportes pero puntaje es 1000'
        WHEN COUNT(th.TRHId) = 0 AND tp.TPPuntaje != 1000 THEN 'REVISAR - Sin reportes pero puntaje no es 1000'
        ELSE 'OK'
    END as estado_validacion
FROM tpersonas tp
LEFT JOIN tcontratoarriendo_relacion car ON tp.TPNoDocumento = car.TPNoDocumento
LEFT JOIN thistorial th ON car.TCAIDContrato = th.TCAIDContrato
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
GROUP BY tp.TPNoDocumento, tp.TPNombres, tp.TPPuntaje
ORDER BY estado_validacion DESC, cantidad_reportes DESC;
"""

# ============================================================================
# 8. REPORTES - ARRENDATARIOS CON PUNTAJE BAJO (RIESGO)
# ============================================================================
"""
SELECT 
    tp.TPNoDocumento,
    tp.TPNombres,
    tp.TPApellidos,
    tp.TPPuntaje,
    COUNT(th.TRHId) as cantidad_reportes,
    MAX(th.TRFechaReporte) as ultimo_reporte,
    SUM(th.TRHValorAdeudado) as valor_total_adeudado
FROM tpersonas tp
LEFT JOIN tcontratoarriendo_relacion car ON tp.TPNoDocumento = car.TPNoDocumento
LEFT JOIN thistorial th ON car.TCAIDContrato = th.TCAIDContrato
WHERE car.TCARTipoParticipacion = 'ARRENDATARIO'
GROUP BY tp.TPNoDocumento, tp.TPNombres, tp.TPApellidos, tp.TPPuntaje
HAVING tp.TPPuntaje < 600  -- Puntaje bajo = riesgo
ORDER BY tp.TPPuntaje ASC;
"""
