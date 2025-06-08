-- Actualizar la tabla sub_tratamientos para permitir duraciones personalizadas
ALTER TABLE sub_tratamientos
  DROP CONSTRAINT IF EXISTS sub_tratamientos_duracion_check,
  ADD CONSTRAINT sub_tratamientos_duracion_check CHECK (duracion > 0),
  DROP CONSTRAINT IF EXISTS sub_tratamientos_precio_check,
  ADD CONSTRAINT sub_tratamientos_precio_check CHECK (precio >= 0);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN sub_tratamientos.duracion IS 'Duración del sub-tratamiento en minutos. Puede ser cualquier número entero positivo.';
COMMENT ON COLUMN sub_tratamientos.precio IS 'Precio del sub-tratamiento. Debe ser mayor o igual a 0.';

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_sub_tratamientos_tratamiento_id ON sub_tratamientos(tratamiento_id);
CREATE INDEX IF NOT EXISTS idx_sub_tratamientos_nombre ON sub_tratamientos(nombre);

-- Agregar política de seguridad para permitir acceso público a sub-tratamientos
CREATE POLICY "Permitir acceso público a sub-tratamientos"
  ON sub_tratamientos
  FOR SELECT
  TO public
  USING (true);

-- Agregar política de seguridad para permitir acceso autenticado a sub-tratamientos
CREATE POLICY "Permitir acceso autenticado a sub-tratamientos"
  ON sub_tratamientos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true); 