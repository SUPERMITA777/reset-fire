-- Agregar columna es_multiple a rf_citas
ALTER TABLE rf_citas
ADD COLUMN IF NOT EXISTS es_multiple BOOLEAN DEFAULT false;

-- Crear tabla rf_citas_clientes para manejar citas múltiples
CREATE TABLE IF NOT EXISTS rf_citas_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID NOT NULL REFERENCES rf_citas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES rf_clientes(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    sena DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_cliente_cita UNIQUE(cita_id, cliente_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_rf_citas_clientes_cita ON rf_citas_clientes(cita_id);
CREATE INDEX IF NOT EXISTS idx_rf_citas_clientes_cliente ON rf_citas_clientes(cliente_id);

-- Habilitar RLS
ALTER TABLE rf_citas_clientes ENABLE ROW LEVEL SECURITY;

-- Crear política que permite todas las operaciones
CREATE POLICY "rf_citas_clientes_policy"
ON rf_citas_clientes
FOR ALL
USING (true)
WITH CHECK (true);

-- Crear función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_rf_citas_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_rf_citas_clientes_updated_at
    BEFORE UPDATE ON rf_citas_clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_rf_citas_clientes_updated_at();

-- Comentarios explicativos
COMMENT ON TABLE rf_citas_clientes IS 'Tabla para gestionar los clientes asociados a citas múltiples';
COMMENT ON COLUMN rf_citas_clientes.cita_id IS 'ID de la cita múltiple';
COMMENT ON COLUMN rf_citas_clientes.cliente_id IS 'ID del cliente asociado a la cita';
COMMENT ON COLUMN rf_citas_clientes.total IS 'Total a pagar por el cliente';
COMMENT ON COLUMN rf_citas_clientes.sena IS 'Monto de la seña pagada por el cliente'; 