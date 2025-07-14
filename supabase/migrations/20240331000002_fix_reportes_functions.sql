-- Corregir funciones de reportes
-- Migración: 20240331000002_fix_reportes_functions.sql

-- Eliminar funciones existentes si existen
DROP FUNCTION IF EXISTS obtener_reporte_semanal(DATE, DATE);
DROP FUNCTION IF EXISTS obtener_egresos_por_categoria(DATE, DATE);

-- Función para obtener reporte semanal (corregida)
CREATE OR REPLACE FUNCTION obtener_reporte_semanal(fecha_inicio_param DATE DEFAULT CURRENT_DATE - INTERVAL '6 days', fecha_fin_param DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    fecha_inicio DATE,
    fecha_fin DATE,
    ingresos_turnos DECIMAL(10,2),
    ingresos_productos DECIMAL(10,2),
    ingresos_senas DECIMAL(10,2),
    ingresos_otros DECIMAL(10,2),
    total_ingresos DECIMAL(10,2),
    total_egresos DECIMAL(10,2),
    balance DECIMAL(10,2),
    cantidad_citas INTEGER,
    cantidad_transacciones INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH ingresos_por_tipo AS (
        SELECT 
            tipo,
            COALESCE(SUM(monto), 0) as total
        FROM rf_ingresos 
        WHERE fecha BETWEEN fecha_inicio_param AND fecha_fin_param
        GROUP BY tipo
    ),
    egresos_periodo AS (
        SELECT COALESCE(SUM(monto), 0) as total
        FROM rf_egresos 
        WHERE fecha BETWEEN fecha_inicio_param AND fecha_fin_param
    ),
    citas_periodo AS (
        SELECT COUNT(*) as cantidad
        FROM rf_citas 
        WHERE fecha BETWEEN fecha_inicio_param AND fecha_fin_param
    ),
    transacciones_periodo AS (
        SELECT COUNT(*) as cantidad
        FROM rf_transacciones 
        WHERE DATE(created_at) BETWEEN fecha_inicio_param AND fecha_fin_param
    )
    SELECT 
        fecha_inicio_param,
        fecha_fin_param,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'turno'), 0) as ingresos_turnos,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'producto'), 0) as ingresos_productos,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'seña'), 0) as ingresos_senas,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'otro'), 0) as ingresos_otros,
        COALESCE((SELECT SUM(total) FROM ingresos_por_tipo), 0) as total_ingresos,
        (SELECT total FROM egresos_periodo) as total_egresos,
        COALESCE((SELECT SUM(total) FROM ingresos_por_tipo), 0) - (SELECT total FROM egresos_periodo) as balance,
        (SELECT cantidad FROM citas_periodo) as cantidad_citas,
        (SELECT cantidad FROM transacciones_periodo) as cantidad_transacciones;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener egresos por categoría (corregida)
CREATE OR REPLACE FUNCTION obtener_egresos_por_categoria(fecha_inicio_param DATE DEFAULT CURRENT_DATE - INTERVAL '30 days', fecha_fin_param DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    categoria VARCHAR(100),
    total DECIMAL(10,2),
    cantidad INTEGER,
    porcentaje DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH egresos_categoria AS (
        SELECT 
            e.categoria,
            SUM(e.monto) as total,
            COUNT(*) as cantidad
        FROM rf_egresos e
        WHERE e.fecha BETWEEN fecha_inicio_param AND fecha_fin_param
        GROUP BY e.categoria
    ),
    total_egresos AS (
        SELECT SUM(total) as total_general
        FROM egresos_categoria
    )
    SELECT 
        ec.categoria,
        ec.total,
        ec.cantidad,
        ROUND((ec.total / (SELECT total_general FROM total_egresos)) * 100, 2) as porcentaje
    FROM egresos_categoria ec
    ORDER BY ec.total DESC;
END;
$$ LANGUAGE plpgsql; 