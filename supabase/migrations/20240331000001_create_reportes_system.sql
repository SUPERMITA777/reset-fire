-- Sistema de Reportes y Gestión Financiera
-- Migración: 20240331000001_create_reportes_system.sql

-- Crear tabla de ingresos
CREATE TABLE IF NOT EXISTS rf_ingresos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('turno', 'producto', 'seña', 'otro')),
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME DEFAULT CURRENT_TIME,
    cliente_id UUID REFERENCES rf_clientes(id) ON DELETE SET NULL,
    cita_id UUID REFERENCES rf_citas(id) ON DELETE SET NULL,
    transaccion_id UUID REFERENCES rf_transacciones(id) ON DELETE SET NULL,
    metodo_pago VARCHAR(50) DEFAULT 'efectivo',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de egresos
CREATE TABLE IF NOT EXISTS rf_egresos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME DEFAULT CURRENT_TIME,
    proveedor VARCHAR(200),
    factura_numero VARCHAR(50),
    metodo_pago VARCHAR(50) DEFAULT 'efectivo',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de categorías de egresos
CREATE TABLE IF NOT EXISTS rf_categorias_egresos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías básicas de egresos
INSERT INTO rf_categorias_egresos (nombre, descripcion, color) VALUES
('Insumos', 'Materiales y productos para tratamientos', '#ef4444'),
('Equipamiento', 'Compra y mantenimiento de equipos', '#f59e0b'),
('Servicios', 'Servicios externos (limpieza, mantenimiento)', '#10b981'),
('Personal', 'Salarios y beneficios del personal', '#8b5cf6'),
('Marketing', 'Publicidad y promociones', '#06b6d4'),
('Alquiler', 'Pago de alquiler del local', '#84cc16'),
('Servicios Públicos', 'Luz, agua, gas, internet', '#f97316'),
('Seguros', 'Pólizas de seguro', '#ec4899'),
('Otros', 'Otros gastos varios', '#6b7280')
ON CONFLICT (nombre) DO NOTHING;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON rf_ingresos(fecha);
CREATE INDEX IF NOT EXISTS idx_ingresos_tipo ON rf_ingresos(tipo);
CREATE INDEX IF NOT EXISTS idx_ingresos_cliente ON rf_ingresos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ingresos_cita ON rf_ingresos(cita_id);

CREATE INDEX IF NOT EXISTS idx_egresos_fecha ON rf_egresos(fecha);
CREATE INDEX IF NOT EXISTS idx_egresos_categoria ON rf_egresos(categoria);

-- Habilitar RLS
ALTER TABLE rf_ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rf_egresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rf_categorias_egresos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Permitir acceso completo a ingresos" ON rf_ingresos
    FOR ALL USING (true);

CREATE POLICY "Permitir acceso completo a egresos" ON rf_egresos
    FOR ALL USING (true);

CREATE POLICY "Permitir acceso completo a categorías" ON rf_categorias_egresos
    FOR ALL USING (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_ingresos_updated_at
    BEFORE UPDATE ON rf_ingresos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_egresos_updated_at
    BEFORE UPDATE ON rf_egresos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_egresos_updated_at
    BEFORE UPDATE ON rf_categorias_egresos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener reporte diario
CREATE OR REPLACE FUNCTION obtener_reporte_diario(fecha_reporte DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    fecha DATE,
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
        WHERE fecha = fecha_reporte
        GROUP BY tipo
    ),
    egresos_del_dia AS (
        SELECT COALESCE(SUM(monto), 0) as total
        FROM rf_egresos 
        WHERE fecha = fecha_reporte
    ),
    citas_del_dia AS (
        SELECT COUNT(*) as cantidad
        FROM rf_citas 
        WHERE fecha = fecha_reporte
    ),
    transacciones_del_dia AS (
        SELECT COUNT(*) as cantidad
        FROM rf_transacciones 
        WHERE DATE(created_at) = fecha_reporte
    )
    SELECT 
        fecha_reporte as fecha,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'turno'), 0) as ingresos_turnos,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'producto'), 0) as ingresos_productos,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'seña'), 0) as ingresos_senas,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'otro'), 0) as ingresos_otros,
        COALESCE((SELECT SUM(total) FROM ingresos_por_tipo), 0) as total_ingresos,
        (SELECT total FROM egresos_del_dia) as total_egresos,
        COALESCE((SELECT SUM(total) FROM ingresos_por_tipo), 0) - (SELECT total FROM egresos_del_dia) as balance,
        (SELECT cantidad FROM citas_del_dia) as cantidad_citas,
        (SELECT cantidad FROM transacciones_del_dia) as cantidad_transacciones;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener reporte semanal
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

-- Función para obtener reporte mensual
CREATE OR REPLACE FUNCTION obtener_reporte_mensual(anio INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE), mes INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE))
RETURNS TABLE (
    anio INTEGER,
    mes INTEGER,
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
        WHERE EXTRACT(YEAR FROM fecha) = anio AND EXTRACT(MONTH FROM fecha) = mes
        GROUP BY tipo
    ),
    egresos_mes AS (
        SELECT COALESCE(SUM(monto), 0) as total
        FROM rf_egresos 
        WHERE EXTRACT(YEAR FROM fecha) = anio AND EXTRACT(MONTH FROM fecha) = mes
    ),
    citas_mes AS (
        SELECT COUNT(*) as cantidad
        FROM rf_citas 
        WHERE EXTRACT(YEAR FROM fecha) = anio AND EXTRACT(MONTH FROM fecha) = mes
    ),
    transacciones_mes AS (
        SELECT COUNT(*) as cantidad
        FROM rf_transacciones 
        WHERE EXTRACT(YEAR FROM created_at) = anio AND EXTRACT(MONTH FROM created_at) = mes
    )
    SELECT 
        anio,
        mes,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'turno'), 0) as ingresos_turnos,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'producto'), 0) as ingresos_productos,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'seña'), 0) as ingresos_senas,
        COALESCE((SELECT total FROM ingresos_por_tipo WHERE tipo = 'otro'), 0) as ingresos_otros,
        COALESCE((SELECT SUM(total) FROM ingresos_por_tipo), 0) as total_ingresos,
        (SELECT total FROM egresos_mes) as total_egresos,
        COALESCE((SELECT SUM(total) FROM ingresos_por_tipo), 0) - (SELECT total FROM egresos_mes) as balance,
        (SELECT cantidad FROM citas_mes) as cantidad_citas,
        (SELECT cantidad FROM transacciones_mes) as cantidad_transacciones;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener egresos por categoría
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

-- Función para registrar ingreso automático de cita completada
CREATE OR REPLACE FUNCTION registrar_ingreso_cita()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar cuando la cita se marca como completada
    IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
        INSERT INTO rf_ingresos (
            tipo,
            monto,
            descripcion,
            fecha,
            cliente_id,
            cita_id,
            metodo_pago,
            notas
        ) VALUES (
            'turno',
            NEW.precio,
            'Cita completada - ' || COALESCE(NEW.notas, 'Sin observaciones'),
            NEW.fecha,
            NEW.cliente_id,
            NEW.id,
            'efectivo',
            'Registro automático de cita completada'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar ingresos automáticamente cuando se completa una cita
CREATE TRIGGER trigger_registrar_ingreso_cita
    AFTER UPDATE ON rf_citas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_ingreso_cita();

-- Comentarios explicativos
COMMENT ON TABLE rf_ingresos IS 'Tabla para registrar todos los ingresos del negocio';
COMMENT ON TABLE rf_egresos IS 'Tabla para registrar todos los gastos del negocio';
COMMENT ON TABLE rf_categorias_egresos IS 'Tabla para categorizar los diferentes tipos de gastos';
COMMENT ON FUNCTION obtener_reporte_diario IS 'Función para obtener reporte financiero diario';
COMMENT ON FUNCTION obtener_reporte_semanal IS 'Función para obtener reporte financiero semanal';
COMMENT ON FUNCTION obtener_reporte_mensual IS 'Función para obtener reporte financiero mensual';
COMMENT ON FUNCTION obtener_egresos_por_categoria IS 'Función para obtener desglose de egresos por categoría'; 