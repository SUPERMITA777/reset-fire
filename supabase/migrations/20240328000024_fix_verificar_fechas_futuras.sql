-- Corregir la función de verificación de configuración para considerar fechas futuras
CREATE OR REPLACE FUNCTION verificar_configuracion_completa_tratamiento(
    p_tratamiento_id UUID,
    p_box_id INTEGER DEFAULT NULL,
    p_fecha DATE DEFAULT NULL
)
RETURNS TABLE (
    tiene_horarios BOOLEAN,
    cantidad_horarios INTEGER,
    tiene_fechas_disponibles BOOLEAN,
    es_compartido BOOLEAN,
    max_clientes INTEGER,
    boxes_disponibles INTEGER[],
    hora_inicio TIME,
    hora_fin TIME,
    dias_disponibles JSONB
) AS $$
DECLARE
    v_fecha_verificar DATE;
BEGIN
    -- Usar la fecha proporcionada o la fecha actual
    v_fecha_verificar := COALESCE(p_fecha, CURRENT_DATE);

    RETURN QUERY
    WITH config_tratamiento AS (
        SELECT 
            t.id,
            t.es_compartido,
            t.max_clientes_por_turno,
            t.boxes_disponibles,
            t.hora_inicio,
            t.hora_fin,
            EXISTS(
                SELECT 1 
                FROM horarios_tratamientos ht 
                WHERE ht.tratamiento_id = t.id
            ) as tiene_horarios,
            (
                SELECT COUNT(*)::INTEGER 
                FROM horarios_tratamientos ht 
                WHERE ht.tratamiento_id = t.id
            ) as cantidad_horarios,
            EXISTS(
                SELECT 1 
                FROM fechas_disponibles fd 
                WHERE fd.tratamiento_id = t.id
                AND v_fecha_verificar BETWEEN fd.fecha_inicio AND fd.fecha_fin
                AND (p_box_id IS NULL OR p_box_id = ANY(fd.boxes_disponibles))
                AND array_length(fd.boxes_disponibles, 1) > 0
                AND fd.boxes_disponibles IS NOT NULL
                AND NOT (fd.boxes_disponibles @> ARRAY[NULL]::integer[])
            ) as tiene_fechas_disponibles
        FROM tratamientos t
        WHERE t.id = p_tratamiento_id
    )
    SELECT 
        ct.tiene_horarios,
        ct.cantidad_horarios,
        ct.tiene_fechas_disponibles,
        ct.es_compartido,
        COALESCE(ct.max_clientes_por_turno, 1)::INTEGER,
        COALESCE(ct.boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]),
        COALESCE(ct.hora_inicio, '08:00'::time),
        COALESCE(ct.hora_fin, '20:00'::time),
        '["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"]'::jsonb
    FROM config_tratamiento ct;
END;
$$ LANGUAGE plpgsql;

-- Crear una función para validar y corregir boxes_disponibles
CREATE OR REPLACE FUNCTION validar_boxes_disponibles()
RETURNS TRIGGER AS $$
BEGIN
    -- Si boxes_disponibles es NULL o contiene NULL, usar el valor por defecto
    IF NEW.boxes_disponibles IS NULL OR NEW.boxes_disponibles @> ARRAY[NULL]::integer[] THEN
        NEW.boxes_disponibles := '{1,2,3,4,5,6,7,8}'::integer[];
    END IF;
    
    -- Asegurar que no haya duplicados
    NEW.boxes_disponibles := ARRAY(
        SELECT DISTINCT unnest(NEW.boxes_disponibles)
        ORDER BY unnest
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para validar boxes_disponibles
DROP TRIGGER IF EXISTS validate_boxes_disponibles ON fechas_disponibles;
CREATE TRIGGER validate_boxes_disponibles
    BEFORE INSERT OR UPDATE ON fechas_disponibles
    FOR EACH ROW
    EXECUTE FUNCTION validar_boxes_disponibles();

-- Corregir cualquier registro existente con boxes_disponibles inválidos
UPDATE fechas_disponibles
SET boxes_disponibles = '{1,2,3,4,5,6,7,8}'::integer[]
WHERE boxes_disponibles IS NULL 
   OR boxes_disponibles @> ARRAY[NULL]::integer[]
   OR array_length(boxes_disponibles, 1) = 0;

-- Verificar que todo se haya corregido
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM fechas_disponibles 
        WHERE boxes_disponibles IS NULL 
           OR boxes_disponibles @> ARRAY[NULL]::integer[]
           OR array_length(boxes_disponibles, 1) = 0
    ) THEN
        RAISE EXCEPTION 'No se pudieron corregir todos los boxes_disponibles inválidos';
    END IF;
END $$; 