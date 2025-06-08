-- Primero eliminar las funciones existentes
DROP FUNCTION IF EXISTS verificar_disponibilidad_turno_compartido(uuid,date,time without time zone,integer);
DROP FUNCTION IF EXISTS obtener_o_crear_turno_compartido(uuid,date,time without time zone,integer,integer);

-- Crear la función de verificación de disponibilidad
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
  -- Obtener el máximo de clientes permitidos para el tratamiento
  SELECT max_clientes_por_turno INTO v_max_clientes
  FROM tratamientos
  WHERE id = p_tratamiento_id;

  -- Si no se encuentra el tratamiento, retornar false
  IF v_max_clientes IS NULL THEN
    RETURN FALSE;
  END IF;

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

  -- Contar cuántos clientes ya están en el turno
  SELECT COUNT(*) INTO v_clientes_actuales
  FROM citas
  WHERE turno_compartido_id = v_turno_compartido_id
    AND estado != 'cancelado'; -- No contar citas canceladas

  -- Verificar si hay cupo disponible
  RETURN v_clientes_actuales < v_max_clientes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear la función para obtener o crear turno compartido
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
  v_disponible BOOLEAN;
BEGIN
  -- Verificar disponibilidad
  SELECT verificar_disponibilidad_turno_compartido(
    p_tratamiento_id,
    p_fecha,
    p_hora_inicio,
    p_box_id
  ) INTO v_disponible;

  -- Si no hay disponibilidad, lanzar error
  IF NOT v_disponible THEN
    RAISE EXCEPTION 'No hay cupos disponibles para este turno';
  END IF;

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

-- Agregar comentarios
COMMENT ON FUNCTION verificar_disponibilidad_turno_compartido IS 'Verifica la disponibilidad de un turno compartido considerando el máximo de clientes permitidos y excluyendo citas canceladas';
COMMENT ON FUNCTION obtener_o_crear_turno_compartido IS 'Obtiene o crea un turno compartido, verificando disponibilidad antes de permitir la creación'; 