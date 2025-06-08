-- Primero eliminar la función existente
DROP FUNCTION IF EXISTS obtener_o_crear_turno_compartido(uuid,date,time without time zone,integer,integer);

-- Luego recrear la función con los nuevos parámetros
CREATE OR REPLACE FUNCTION obtener_o_crear_turno_compartido(
  p_tratamiento_id UUID,
  p_fecha DATE,
  p_hora_inicio TIME,
  p_box_id INTEGER,
  p_max_clientes INTEGER
) RETURNS UUID AS $$
DECLARE
  v_turno_compartido_id UUID;
  v_clientes_actuales INTEGER;
BEGIN
  -- Buscar turno compartido existente
  SELECT id INTO v_turno_compartido_id
  FROM turnos_compartidos
  WHERE tratamiento_id = p_tratamiento_id
    AND fecha = p_fecha
    AND hora_inicio = p_hora_inicio
    AND box_id = p_box_id;

  -- Si no existe, crear uno nuevo
  IF v_turno_compartido_id IS NULL THEN
    INSERT INTO turnos_compartidos (
      tratamiento_id,
      fecha,
      hora_inicio,
      box_id,
      max_clientes
    ) VALUES (
      p_tratamiento_id,
      p_fecha,
      p_hora_inicio,
      p_box_id,
      p_max_clientes
    )
    RETURNING id INTO v_turno_compartido_id;
  END IF;

  RETURN v_turno_compartido_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION obtener_o_crear_turno_compartido TO anon, authenticated;

-- Agregar comentario
COMMENT ON FUNCTION obtener_o_crear_turno_compartido IS 'Obtiene o crea un turno compartido, permitiendo múltiples clientes hasta el máximo configurado'; 