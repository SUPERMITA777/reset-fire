-- Crear tabla para el carrito de compras
CREATE TABLE IF NOT EXISTS rf_carrito_compras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES rf_clientes(id) ON DELETE CASCADE,
    session_id TEXT, -- Para carritos sin cliente logueado
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'abandonado')),
    total DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para los items del carrito
CREATE TABLE IF NOT EXISTS rf_carrito_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carrito_id UUID REFERENCES rf_carrito_compras(id) ON DELETE CASCADE,
    tratamiento_id UUID REFERENCES rf_tratamientos(id) ON DELETE CASCADE,
    subtratamiento_id UUID REFERENCES rf_subtratamientos(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_carrito_cliente_id ON rf_carrito_compras(cliente_id);
CREATE INDEX IF NOT EXISTS idx_carrito_session_id ON rf_carrito_compras(session_id);
CREATE INDEX IF NOT EXISTS idx_carrito_estado ON rf_carrito_compras(estado);
CREATE INDEX IF NOT EXISTS idx_carrito_items_carrito_id ON rf_carrito_items(carrito_id);

-- Crear función para actualizar el total del carrito
CREATE OR REPLACE FUNCTION actualizar_total_carrito()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE rf_carrito_compras 
    SET 
        subtotal = (
            SELECT COALESCE(SUM(precio_total - descuento), 0)
            FROM rf_carrito_items 
            WHERE carrito_id = COALESCE(NEW.carrito_id, OLD.carrito_id)
        ),
        total = (
            SELECT COALESCE(SUM(precio_total - descuento), 0)
            FROM rf_carrito_items 
            WHERE carrito_id = COALESCE(NEW.carrito_id, OLD.carrito_id)
        ) + impuestos - descuento,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.carrito_id, OLD.carrito_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para mantener actualizado el total
CREATE TRIGGER trigger_actualizar_total_carrito
    AFTER INSERT OR UPDATE OR DELETE ON rf_carrito_items
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_total_carrito();

-- Crear función para limpiar carritos abandonados (más de 24 horas)
CREATE OR REPLACE FUNCTION limpiar_carritos_abandonados()
RETURNS INTEGER AS $$
DECLARE
    carritos_eliminados INTEGER;
BEGIN
    DELETE FROM rf_carrito_compras 
    WHERE estado = 'activo' 
    AND created_at < NOW() - INTERVAL '24 hours'
    AND cliente_id IS NULL; -- Solo carritos sin cliente
    
    GET DIAGNOSTICS carritos_eliminados = ROW_COUNT;
    RETURN carritos_eliminados;
END;
$$ LANGUAGE plpgsql;

-- Crear políticas RLS (Row Level Security)
ALTER TABLE rf_carrito_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE rf_carrito_items ENABLE ROW LEVEL SECURITY;

-- Políticas para carrito_compras
CREATE POLICY "Usuarios pueden ver sus propios carritos" ON rf_carrito_compras
    FOR SELECT USING (cliente_id IS NOT NULL);

CREATE POLICY "Usuarios pueden crear carritos" ON rf_carrito_compras
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar sus carritos" ON rf_carrito_compras
    FOR UPDATE USING (cliente_id IS NOT NULL);

CREATE POLICY "Usuarios pueden eliminar sus carritos" ON rf_carrito_compras
    FOR DELETE USING (cliente_id IS NOT NULL);

-- Políticas para carrito_items
CREATE POLICY "Usuarios pueden ver items de sus carritos" ON rf_carrito_items
    FOR SELECT USING (
        carrito_id IN (
            SELECT id FROM rf_carrito_compras 
            WHERE cliente_id IS NOT NULL
        )
    );

CREATE POLICY "Usuarios pueden crear items en sus carritos" ON rf_carrito_items
    FOR INSERT WITH CHECK (
        carrito_id IN (
            SELECT id FROM rf_carrito_compras 
            WHERE cliente_id IS NOT NULL
        )
    );

CREATE POLICY "Usuarios pueden actualizar items de sus carritos" ON rf_carrito_items
    FOR UPDATE USING (
        carrito_id IN (
            SELECT id FROM rf_carrito_compras 
            WHERE cliente_id IS NOT NULL
        )
    );

CREATE POLICY "Usuarios pueden eliminar items de sus carritos" ON rf_carrito_items
    FOR DELETE USING (
        carrito_id IN (
            SELECT id FROM rf_carrito_compras 
            WHERE cliente_id IS NOT NULL
        )
    ); 