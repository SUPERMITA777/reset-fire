-- Crear tabla para horarios de tratamientos
CREATE TABLE IF NOT EXISTS horarios_tratamientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tratamiento_id UUID NOT NULL REFERENCES tratamientos(id) ON DELETE CASCADE,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(tratamiento_id, hora_inicio)
);

-- Agregar columna para indicar si el tratamiento es compartido
ALTER TABLE tratamientos
ADD COLUMN IF NOT EXISTS es_compartido BOOLEAN DEFAULT false;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_horarios_tratamientos_tratamiento_id ON horarios_tratamientos(tratamiento_id);
CREATE INDEX IF NOT EXISTS idx_horarios_tratamientos_hora_inicio ON horarios_tratamientos(hora_inicio);

-- Agregar políticas de seguridad
CREATE POLICY "Permitir acceso público a horarios de tratamientos"
  ON horarios_tratamientos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir acceso autenticado a horarios de tratamientos"
  ON horarios_tratamientos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Función para obtener horarios disponibles de un tratamiento
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

-- Comentarios
COMMENT ON TABLE horarios_tratamientos IS 'Almacena los horarios específicos para tratamientos compartidos';
COMMENT ON COLUMN tratamientos.es_compartido IS 'Indica si el tratamiento permite múltiples clientes en el mismo horario';
COMMENT ON FUNCTION obtener_horarios_disponibles_tratamiento IS 'Obtiene los horarios disponibles para un tratamiento compartido, incluyendo el número de vacantes disponibles'; 