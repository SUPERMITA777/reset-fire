-- Eliminar la función si existe
DROP FUNCTION IF EXISTS verificar_configuracion_completa_tratamiento;

-- Crear la función corregida
CREATE OR REPLACE FUNCTION verificar_configuracion_completa_tratamiento(
    p_tratamiento_id UUID,
    p_box_id INTEGER DEFAULT NULL
) RETURNS TABLE (
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
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM horarios_tratamientos WHERE tratamiento_id = p_tratamiento_id) as tiene_horarios,
        (SELECT COUNT(*)::INTEGER FROM horarios_tratamientos WHERE tratamiento_id = p_tratamiento_id) as cantidad_horarios,
        EXISTS(
            SELECT 1 
            FROM fechas_disponibles 
            WHERE tratamiento_id = p_tratamiento_id 
            AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
            AND (p_box_id IS NULL OR p_box_id = ANY(boxes_disponibles))
        ) as tiene_fechas_disponibles,
        t.es_compartido,
        t.max_clientes_por_turno,
        t.boxes_disponibles,
        t.hora_inicio,
        t.hora_fin,
        t.dias_disponibles
    FROM tratamientos t
    WHERE t.id = p_tratamiento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION verificar_configuracion_completa_tratamiento TO anon, authenticated;

-- Comentario
COMMENT ON FUNCTION verificar_configuracion_completa_tratamiento IS 'Verifica la configuración completa de un tratamiento, incluyendo horarios, fechas disponibles y boxes. Si se proporciona p_box_id, verifica que el box esté disponible.';

-- Verificar que la función se creó correctamente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname = 'verificar_configuracion_completa_tratamiento'
    ) THEN
        RAISE EXCEPTION 'La función verificar_configuracion_completa_tratamiento no se creó correctamente';
    END IF;
END $$; 