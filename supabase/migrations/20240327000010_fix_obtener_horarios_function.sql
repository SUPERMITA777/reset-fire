-- Eliminar la función si existe
DROP FUNCTION IF EXISTS obtener_horarios_disponibles_tratamiento;

-- Crear la función corregida
CREATE OR REPLACE FUNCTION obtener_horarios_disponibles_tratamiento(
  p_tratamiento_id UUID,
  p_fecha DATE,
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
  SELECT 
    max_clientes_por_turno, 
    es_compartido
  INTO 
    v_max_clientes, 
    v_es_compartido
  FROM tratamientos
  WHERE id = p_tratamiento_id;

  -- Si no se encuentra el tratamiento, retornar vacío
  IF v_max_clientes IS NULL THEN
    RETURN;
  END IF;

  -- Retornar horarios disponibles según el tipo de tratamiento
  IF v_es_compartido THEN
    -- Para tratamientos compartidos
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
  ELSE
    -- Para tratamientos no compartidos
    RETURN QUERY
    WITH citas_existentes AS (
      SELECT 
        hora_inicio,
        COUNT(*) as citas_actuales
      FROM citas
      WHERE fecha = p_fecha
        AND box_id = p_box_id
        AND tratamiento_id = p_tratamiento_id
        AND estado != 'cancelado'
      GROUP BY hora_inicio
    )
    SELECT 
      ht.hora_inicio,
      ht.hora_fin,
      CASE 
        WHEN ce.citas_actuales IS NULL THEN 1
        ELSE 0
      END as vacantes_disponibles
    FROM horarios_tratamientos ht
    LEFT JOIN citas_existentes ce ON ce.hora_inicio = ht.hora_inicio
    WHERE ht.tratamiento_id = p_tratamiento_id
    ORDER BY ht.hora_inicio;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION obtener_horarios_disponibles_tratamiento TO anon, authenticated;

-- Comentario
COMMENT ON FUNCTION obtener_horarios_disponibles_tratamiento IS 'Obtiene los horarios disponibles para un tratamiento, manejando tanto tratamientos compartidos como no compartidos';

-- Verificar que la función se creó correctamente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname = 'obtener_horarios_disponibles_tratamiento'
    ) THEN
        RAISE EXCEPTION 'La función obtener_horarios_disponibles_tratamiento no se creó correctamente';
    END IF;
END $$; 