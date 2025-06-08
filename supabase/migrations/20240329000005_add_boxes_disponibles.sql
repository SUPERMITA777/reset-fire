-- Agregar la columna boxes_disponibles a la tabla rf_disponibilidad
ALTER TABLE rf_disponibilidad
ADD COLUMN IF NOT EXISTS boxes_disponibles INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7,8}'::integer[];

-- Agregar comentario a la columna
COMMENT ON COLUMN rf_disponibilidad.boxes_disponibles IS 'Array de boxes disponibles para este rango de fechas';

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_rf_disponibilidad_boxes ON rf_disponibilidad USING gin (boxes_disponibles);

-- Actualizar los registros existentes para asignar boxes por defecto
UPDATE rf_disponibilidad
SET boxes_disponibles = '{1,2,3,4,5,6,7,8}'::integer[]
WHERE boxes_disponibles IS NULL;

-- Asegurar que la columna no sea nula después de la actualización
ALTER TABLE rf_disponibilidad
ALTER COLUMN boxes_disponibles SET NOT NULL; 