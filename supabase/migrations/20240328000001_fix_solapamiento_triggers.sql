-- Eliminar los triggers y funciones existentes
DROP TRIGGER IF EXISTS check_solapamiento_fechas ON fechas_disponibles;
DROP TRIGGER IF EXISTS check_solapamiento_horarios ON fechas_disponibles;
DROP FUNCTION IF EXISTS verificar_solapamiento_fechas();
DROP FUNCTION IF EXISTS verificar_solapamiento_horarios();

-- Crear una nueva función que solo verifica duplicados exactos
CREATE OR REPLACE FUNCTION verificar_duplicado_exacto()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si existe un registro con exactamente los mismos datos
    IF EXISTS (
        SELECT 1
        FROM fechas_disponibles
        WHERE tratamiento_id = NEW.tratamiento_id
        AND id != NEW.id  -- Excluir el registro actual en caso de actualización
        AND fecha_inicio = NEW.fecha_inicio
        AND fecha_fin = NEW.fecha_fin
        AND hora_inicio = NEW.hora_inicio
        AND hora_fin = NEW.hora_fin
        AND boxes_disponibles = NEW.boxes_disponibles
        AND cantidad_clientes = NEW.cantidad_clientes
    ) THEN
        RAISE EXCEPTION 'Ya existe un turno con exactamente los mismos datos (fecha, hora y boxes)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el nuevo trigger
CREATE TRIGGER check_duplicado_exacto
    BEFORE INSERT OR UPDATE ON fechas_disponibles
    FOR EACH ROW
    EXECUTE FUNCTION verificar_duplicado_exacto(); 