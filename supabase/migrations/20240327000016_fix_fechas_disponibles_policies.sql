-- Eliminar todas las políticas existentes de la tabla fechas_disponibles
DROP POLICY IF EXISTS "Permitir acceso público a fechas disponibles" ON fechas_disponibles;
DROP POLICY IF EXISTS "Permitir acceso autenticado a fechas disponibles" ON fechas_disponibles;

-- Crear una única política clara para la tabla fechas_disponibles
CREATE POLICY "fechas_disponibles_policy"
ON fechas_disponibles
FOR ALL
USING (true)
WITH CHECK (true);

-- Asegurarse de que RLS esté habilitado
ALTER TABLE fechas_disponibles ENABLE ROW LEVEL SECURITY;

-- Comentario explicativo
COMMENT ON POLICY "fechas_disponibles_policy" ON fechas_disponibles IS 'Política que permite todas las operaciones en la tabla fechas_disponibles para usuarios autenticados y anónimos';

-- Verificar la estructura de la tabla
DO $$
BEGIN
    -- Verificar si existe la columna cantidad_clientes
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fechas_disponibles' 
        AND column_name = 'cantidad_clientes'
    ) THEN
        -- Agregar la columna si no existe
        ALTER TABLE fechas_disponibles
        ADD COLUMN cantidad_clientes INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$; 