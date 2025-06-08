-- Crear la tabla rf_tratamientos
CREATE TABLE IF NOT EXISTS rf_tratamientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_tratamiento VARCHAR(255) NOT NULL,
    box INTEGER NOT NULL CHECK (box > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_rf_tratamientos_nombre ON rf_tratamientos(nombre_tratamiento);
CREATE INDEX IF NOT EXISTS idx_rf_tratamientos_box ON rf_tratamientos(box);

-- Habilitar RLS
ALTER TABLE rf_tratamientos ENABLE ROW LEVEL SECURITY;

-- Crear política que permite todas las operaciones
CREATE POLICY "rf_tratamientos_policy"
ON rf_tratamientos
FOR ALL
USING (true)
WITH CHECK (true);

-- Comentario explicativo
COMMENT ON TABLE rf_tratamientos IS 'Tabla para gestionar los tratamientos de Reset Fire';
COMMENT ON COLUMN rf_tratamientos.nombre_tratamiento IS 'Nombre del tratamiento';
COMMENT ON COLUMN rf_tratamientos.box IS 'Número del box asignado al tratamiento'; 