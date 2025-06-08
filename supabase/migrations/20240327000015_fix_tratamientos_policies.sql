-- Eliminar todas las políticas existentes de la tabla tratamientos
DROP POLICY IF EXISTS "Permitir acceso público a tratamientos" ON tratamientos;
DROP POLICY IF EXISTS "Permitir acceso autenticado a tratamientos" ON tratamientos;
DROP POLICY IF EXISTS "Permitir todas las operaciones en tratamientos" ON tratamientos;
DROP POLICY IF EXISTS "Permitir acceso anónimo a tratamientos" ON tratamientos;

-- Crear una única política clara para la tabla tratamientos
CREATE POLICY "tratamientos_policy"
ON tratamientos
FOR ALL
USING (true)
WITH CHECK (true);

-- Asegurarse de que RLS esté habilitado
ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;

-- Comentario explicativo
COMMENT ON POLICY "tratamientos_policy" ON tratamientos IS 'Política que permite todas las operaciones en la tabla tratamientos para usuarios autenticados y anónimos'; 