-- Agregar columnas necesarias a rf_tratamientos
ALTER TABLE rf_tratamientos
ADD COLUMN IF NOT EXISTS max_clientes_por_turno INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS boxes_disponibles INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7,8}'::integer[];

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_rf_tratamientos_max_clientes ON rf_tratamientos(max_clientes_por_turno);
CREATE INDEX IF NOT EXISTS idx_rf_tratamientos_boxes ON rf_tratamientos USING gin (boxes_disponibles);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN rf_tratamientos.max_clientes_por_turno IS 'Número máximo de clientes que pueden atenderse simultáneamente en este tratamiento';
COMMENT ON COLUMN rf_tratamientos.boxes_disponibles IS 'Array de boxes disponibles para este tratamiento';

-- Actualizar los registros existentes
UPDATE rf_tratamientos
SET 
    max_clientes_por_turno = 1,
    boxes_disponibles = '{1,2,3,4,5,6,7,8}'::integer[]
WHERE max_clientes_por_turno IS NULL OR boxes_disponibles IS NULL; 