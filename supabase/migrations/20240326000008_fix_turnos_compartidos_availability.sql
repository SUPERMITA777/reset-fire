-- Modificar la función verificar_disponibilidad_turno_compartido para considerar el max_clientes_por_turno
CREATE OR REPLACE FUNCTION verificar_disponibilidad_turno_compartido(
  p_tratamiento_id UUID,
  p_fecha DATE,
  p_hora_inicio TIME,
  p_box_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_turno_compartido_id UUID;
  v_clientes_actuales INTEGER;
  v_max_clientes INTEGER;
BEGIN
  -- Obtener el turno compartido existente
  SELECT id INTO v_turno_compartido_id
  FROM turnos_compartidos
  WHERE tratamiento_id = p_tratamiento_id
    AND fecha = p_fecha
    AND hora_inicio = p_hora_inicio
    AND box_id = p_box_id;

  -- Si no existe un turno compartido, está disponible
  IF v_turno_compartido_id IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Obtener el máximo de clientes permitidos para el tratamiento
  SELECT max_clientes_por_turno INTO v_max_clientes
  FROM tratamientos
  WHERE id = p_tratamiento_id;

  -- Contar cuántos clientes ya están en el turno
  SELECT COUNT(*) INTO v_clientes_actuales
  FROM citas
  WHERE turno_compartido_id = v_turno_compartido_id;

  -- Verificar si hay cupo disponible
  RETURN v_clientes_actuales < v_max_clientes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modificar la función obtener_o_crear_turno_compartido para manejar múltiples clientes
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
GRANT EXECUTE ON FUNCTION verificar_disponibilidad_turno_compartido TO anon, authenticated;
GRANT EXECUTE ON FUNCTION obtener_o_crear_turno_compartido TO anon, authenticated;

-- Comentarios
COMMENT ON FUNCTION verificar_disponibilidad_turno_compartido IS 'Verifica la disponibilidad de un turno compartido considerando el máximo de clientes permitidos';
COMMENT ON FUNCTION obtener_o_crear_turno_compartido IS 'Obtiene o crea un turno compartido, permitiendo múltiples clientes hasta el máximo configurado'; 