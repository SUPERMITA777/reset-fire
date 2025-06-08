-- Configurar permisos para la función obtener_o_crear_turno_compartido
ALTER FUNCTION obtener_o_crear_turno_compartido SECURITY DEFINER;

-- Otorgar permisos de ejecución a usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION obtener_o_crear_turno_compartido TO anon, authenticated;

-- Crear políticas de seguridad para permitir el acceso público
CREATE POLICY "Permitir acceso público a obtener_o_crear_turno_compartido"
ON turnos_compartidos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Comentario descriptivo
COMMENT ON FUNCTION obtener_o_crear_turno_compartido IS 'Función para obtener o crear un turno compartido, accesible públicamente para la creación de citas'; 