-- Crear la tabla rf_subtratamientos
CREATE TABLE IF NOT EXISTS rf_subtratamientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tratamiento_id UUID NOT NULL REFERENCES rf_tratamientos(id) ON DELETE CASCADE,
    nombre_subtratamiento VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    duracion INTEGER NOT NULL CHECK (duracion > 0), -- duración en minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_subtratamiento_por_tratamiento UNIQUE(tratamiento_id, nombre_subtratamiento)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_rf_subtratamientos_tratamiento ON rf_subtratamientos(tratamiento_id);
CREATE INDEX IF NOT EXISTS idx_rf_subtratamientos_nombre ON rf_subtratamientos(nombre_subtratamiento);
CREATE INDEX IF NOT EXISTS idx_rf_subtratamientos_precio ON rf_subtratamientos(precio);

-- Habilitar RLS
ALTER TABLE rf_subtratamientos ENABLE ROW LEVEL SECURITY;

-- Crear política que permite todas las operaciones
CREATE POLICY "rf_subtratamientos_policy"
ON rf_subtratamientos
FOR ALL
USING (true)
WITH CHECK (true);

-- Comentarios explicativos
COMMENT ON TABLE rf_subtratamientos IS 'Tabla para gestionar los subtratamientos de Reset Fire';
COMMENT ON COLUMN rf_subtratamientos.tratamiento_id IS 'ID del tratamiento al que pertenece este subtratamiento';
COMMENT ON COLUMN rf_subtratamientos.nombre_subtratamiento IS 'Nombre del subtratamiento';
COMMENT ON COLUMN rf_subtratamientos.precio IS 'Precio del subtratamiento en la moneda local';
COMMENT ON COLUMN rf_subtratamientos.duracion IS 'Duración del subtratamiento en minutos';

-- Crear función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_rf_subtratamientos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_rf_subtratamientos_updated_at
    BEFORE UPDATE ON rf_subtratamientos
    FOR EACH ROW
    EXECUTE FUNCTION update_rf_subtratamientos_updated_at(); 