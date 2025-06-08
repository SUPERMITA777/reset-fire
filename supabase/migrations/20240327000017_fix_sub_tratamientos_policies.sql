-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir acceso público a sub_tratamientos" ON sub_tratamientos;
DROP POLICY IF EXISTS "Permitir acceso autenticado a sub_tratamientos" ON sub_tratamientos;
DROP POLICY IF EXISTS "Permitir todas las operaciones en sub_tratamientos" ON sub_tratamientos;
DROP POLICY IF EXISTS "Permitir acceso anónimo a sub_tratamientos" ON sub_tratamientos;

-- Crear una nueva política que permita todas las operaciones
CREATE POLICY "sub_tratamientos_policy" ON sub_tratamientos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Asegurar que RLS está habilitado
ALTER TABLE sub_tratamientos ENABLE ROW LEVEL SECURITY;

-- Agregar comentario explicativo
COMMENT ON POLICY "sub_tratamientos_policy" ON sub_tratamientos IS 'Política que permite todas las operaciones en la tabla sub_tratamientos para usuarios autenticados y anónimos'; 