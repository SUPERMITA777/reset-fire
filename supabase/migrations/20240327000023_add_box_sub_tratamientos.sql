-- Agregar la columna box a la tabla sub_tratamientos
ALTER TABLE sub_tratamientos
ADD COLUMN IF NOT EXISTS box INTEGER NOT NULL DEFAULT 1
CHECK (box BETWEEN 1 AND 8);

-- Agregar comentario a la columna
COMMENT ON COLUMN sub_tratamientos.box IS 'Box asignado para este sub-tratamiento (1-8)';

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_sub_tratamientos_box ON sub_tratamientos(box);

-- Actualizar los registros existentes para asignar un box por defecto
UPDATE sub_tratamientos
SET box = 1
WHERE box IS NULL;

-- Asegurar que la columna no sea nula después de la actualización
ALTER TABLE sub_tratamientos
ALTER COLUMN box SET NOT NULL; 