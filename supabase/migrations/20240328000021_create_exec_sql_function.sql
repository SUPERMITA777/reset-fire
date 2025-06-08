-- Crear función para ejecutar SQL de manera segura
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

-- Comentario
COMMENT ON FUNCTION exec_sql IS 'Función para ejecutar SQL de manera segura desde scripts de migración'; 