-- Eliminar la función si existe
DROP FUNCTION IF EXISTS verificar_configuracion_tratamiento;

-- Crear la función de verificación de configuración
CREATE OR REPLACE FUNCTION verificar_configuracion_tratamiento(p_tratamiento_id UUID)
RETURNS TABLE (
    tiene_horarios BOOLEAN,
    cantidad_horarios INTEGER,
    tiene_fechas_disponibles BOOLEAN,
    es_compartido BOOLEAN,
    max_clientes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM horarios_tratamientos WHERE tratamiento_id = p_tratamiento_id) as tiene_horarios,
        (SELECT COUNT(*) FROM horarios_tratamientos WHERE tratamiento_id = p_tratamiento_id) as cantidad_horarios,
        EXISTS(
            SELECT 1 
            FROM fechas_disponibles 
            WHERE tratamiento_id = p_tratamiento_id 
            AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
        ) as tiene_fechas_disponibles,
        t.es_compartido,
        t.max_clientes_por_turno
    FROM tratamientos t
    WHERE t.id = p_tratamiento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION verificar_configuracion_tratamiento TO anon, authenticated;

-- Comentario
COMMENT ON FUNCTION verificar_configuracion_tratamiento IS 'Verifica la configuración de un tratamiento, incluyendo horarios y fechas disponibles';

-- Verificar que la función se creó correctamente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname = 'verificar_configuracion_tratamiento'
    ) THEN
        RAISE EXCEPTION 'La función verificar_configuracion_tratamiento no se creó correctamente';
    END IF;
END $$; 