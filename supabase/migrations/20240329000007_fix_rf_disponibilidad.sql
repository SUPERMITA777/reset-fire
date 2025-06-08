-- Primero, asegurarnos de que la columna boxes_disponibles exista
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'rf_disponibilidad' 
        AND column_name = 'boxes_disponibles'
    ) THEN
        ALTER TABLE rf_disponibilidad
        ADD COLUMN boxes_disponibles INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7,8}'::integer[];
    END IF;
END $$;

-- Crear índice para mejorar el rendimiento de búsquedas por boxes
CREATE INDEX IF NOT EXISTS idx_rf_disponibilidad_boxes 
ON rf_disponibilidad USING gin (boxes_disponibles);

-- Actualizar los registros existentes para asignar boxes por defecto
UPDATE rf_disponibilidad
SET boxes_disponibles = '{1,2,3,4,5,6,7,8}'::integer[]
WHERE boxes_disponibles IS NULL;

-- Asegurar que la columna no sea nula
ALTER TABLE rf_disponibilidad
ALTER COLUMN boxes_disponibles SET NOT NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN rf_disponibilidad.boxes_disponibles IS 'Array de boxes disponibles para este rango de fechas';

-- Crear función para verificar disponibilidad considerando boxes
CREATE OR REPLACE FUNCTION verificar_disponibilidad_rf_tratamiento(
    p_tratamiento_id UUID,
    p_fecha DATE,
    p_box_id INTEGER DEFAULT NULL
) RETURNS TABLE (
    tiene_disponibilidad BOOLEAN,
    hora_inicio TIME,
    hora_fin TIME,
    boxes_disponibles INTEGER[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(
            SELECT 1 
            FROM rf_disponibilidad 
            WHERE tratamiento_id = p_tratamiento_id 
            AND p_fecha BETWEEN fecha_inicio AND fecha_fin
            AND (p_box_id IS NULL OR p_box_id = ANY(boxes_disponibles))
        ) as tiene_disponibilidad,
        d.hora_inicio,
        d.hora_fin,
        d.boxes_disponibles
    FROM rf_disponibilidad d
    WHERE d.tratamiento_id = p_tratamiento_id 
    AND p_fecha BETWEEN d.fecha_inicio AND d.fecha_fin
    AND (p_box_id IS NULL OR p_box_id = ANY(d.boxes_disponibles))
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION verificar_disponibilidad_rf_tratamiento TO anon, authenticated;

-- Comentario explicativo
COMMENT ON FUNCTION verificar_disponibilidad_rf_tratamiento IS 'Verifica la disponibilidad de un tratamiento en una fecha específica, considerando los boxes disponibles';

-- Insertar datos de prueba si no existen
INSERT INTO rf_disponibilidad (
    tratamiento_id,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_fin,
    boxes_disponibles
)
SELECT 
    t.id as tratamiento_id,
    CURRENT_DATE as fecha_inicio,
    CURRENT_DATE + interval '30 days' as fecha_fin,
    '08:00'::time as hora_inicio,
    '20:00'::time as hora_fin,
    ARRAY[1,2,3,4,5,6,7,8] as boxes_disponibles
FROM rf_tratamientos t
WHERE NOT EXISTS (
    SELECT 1 
    FROM rf_disponibilidad d
    WHERE d.tratamiento_id = t.id
    AND CURRENT_DATE BETWEEN d.fecha_inicio AND d.fecha_fin
); 