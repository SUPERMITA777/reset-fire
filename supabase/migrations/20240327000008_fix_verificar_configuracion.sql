-- Eliminar la función si existe
DROP FUNCTION IF EXISTS verificar_configuracion_tratamiento;

-- Crear la función con el tipo de retorno corregido
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
        (SELECT COUNT(*)::INTEGER FROM horarios_tratamientos WHERE tratamiento_id = p_tratamiento_id) as cantidad_horarios,
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