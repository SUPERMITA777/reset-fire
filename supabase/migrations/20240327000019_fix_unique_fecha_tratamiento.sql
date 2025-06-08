-- Eliminar la restricción única existente
ALTER TABLE fechas_disponibles
DROP CONSTRAINT IF EXISTS unique_fecha_tratamiento;

-- Crear una función para verificar solapamientos
CREATE OR REPLACE FUNCTION verificar_solapamiento_fechas()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si existe algún solapamiento con las fechas existentes
    IF EXISTS (
        SELECT 1
        FROM fechas_disponibles
        WHERE tratamiento_id = NEW.tratamiento_id
        AND id != NEW.id  -- Excluir el registro actual en caso de actualización
        AND (
            -- Caso 1: La nueva fecha_inicio está dentro de un rango existente
            (NEW.fecha_inicio BETWEEN fecha_inicio AND fecha_fin)
            OR
            -- Caso 2: La nueva fecha_fin está dentro de un rango existente
            (NEW.fecha_fin BETWEEN fecha_inicio AND fecha_fin)
            OR
            -- Caso 3: El nuevo rango contiene completamente un rango existente
            (NEW.fecha_inicio <= fecha_inicio AND NEW.fecha_fin >= fecha_fin)
        )
    ) THEN
        RAISE EXCEPTION 'Ya existe un rango de fechas que se solapa con el especificado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para verificar solapamientos
DROP TRIGGER IF EXISTS check_solapamiento_fechas ON fechas_disponibles;
CREATE TRIGGER check_solapamiento_fechas
    BEFORE INSERT OR UPDATE ON fechas_disponibles
    FOR EACH ROW
    EXECUTE FUNCTION verificar_solapamiento_fechas(); 