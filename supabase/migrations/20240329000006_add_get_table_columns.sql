-- Crear función para obtener la estructura de las tablas
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable boolean,
    column_default text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        (c.is_nullable = 'YES')::boolean,
        c.column_default::text
    FROM information_schema.columns c
    WHERE c.table_name = get_table_columns.table_name
    AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION get_table_columns TO anon, authenticated;

-- Comentario explicativo
COMMENT ON FUNCTION get_table_columns IS 'Obtiene la estructura de una tabla, incluyendo nombre de columna, tipo de dato, si es nullable y valor por defecto'; 