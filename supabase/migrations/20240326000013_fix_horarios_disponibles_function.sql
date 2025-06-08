-- Eliminar la función si existe
DROP FUNCTION IF EXISTS obtener_horarios_disponibles_tratamiento;

-- Crear la función con los parámetros correctos
CREATE OR REPLACE FUNCTION obtener_horarios_disponibles_tratamiento(
  p_fecha DATE,
  p_tratamiento_id UUID,
  p_box_id INTEGER
) RETURNS TABLE (
  hora_inicio TIME,
  hora_fin TIME,
  vacantes_disponibles INTEGER
) AS $$
DECLARE
  v_max_clientes INTEGER;
  v_es_compartido BOOLEAN;
BEGIN
  -- Obtener información del tratamiento
  SELECT max_clientes_por_turno, es_compartido 
  INTO v_max_clientes, v_es_compartido
  FROM tratamientos
  WHERE id = p_tratamiento_id;

  -- Si no es un tratamiento compartido, retornar vacío
  IF NOT v_es_compartido THEN
    RETURN;
  END IF;

  -- Retornar horarios con sus vacantes disponibles
  RETURN QUERY
  WITH turnos_existentes AS (
    SELECT 
      tc.hora_inicio,
      COUNT(*) as clientes_actuales
    FROM turnos_compartidos tc
    LEFT JOIN citas c ON c.turno_compartido_id = tc.id
    WHERE tc.tratamiento_id = p_tratamiento_id
      AND tc.fecha = p_fecha
      AND tc.box_id = p_box_id
      AND (c.estado IS NULL OR c.estado != 'cancelado')
    GROUP BY tc.hora_inicio
  )
  SELECT 
    ht.hora_inicio,
    ht.hora_fin,
    GREATEST(0, v_max_clientes - COALESCE(te.clientes_actuales, 0)) as vacantes_disponibles
  FROM horarios_tratamientos ht
  LEFT JOIN turnos_existentes te ON te.hora_inicio = ht.hora_inicio
  WHERE ht.tratamiento_id = p_tratamiento_id
  ORDER BY ht.hora_inicio;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION obtener_horarios_disponibles_tratamiento TO anon, authenticated;

-- Comentario
COMMENT ON FUNCTION obtener_horarios_disponibles_tratamiento IS 'Obtiene los horarios disponibles para un tratamiento compartido, incluyendo el número de vacantes disponibles'; 