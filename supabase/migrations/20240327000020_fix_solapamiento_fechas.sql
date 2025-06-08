-- Eliminar la función y el trigger existentes
DROP TRIGGER IF EXISTS check_solapamiento_fechas ON fechas_disponibles;
DROP FUNCTION IF EXISTS verificar_solapamiento_fechas();

-- Crear una nueva función para verificar solapamientos
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
            -- Caso 1: Mismo día y mismo horario
            (NEW.fecha_inicio = fecha_inicio 
             AND NEW.fecha_fin = fecha_fin 
             AND NEW.hora_inicio = hora_inicio 
             AND NEW.hora_fin = hora_fin)
            OR
            -- Caso 2: Para turnos compartidos (cantidad_clientes > 1)
            (NEW.cantidad_clientes > 1 
             AND fecha_inicio = NEW.fecha_inicio 
             AND fecha_fin = NEW.fecha_fin 
             AND hora_inicio = NEW.hora_inicio)
            OR
            -- Caso 3: Para turnos individuales, verificar solapamiento de rangos
            (NEW.cantidad_clientes = 1 
             AND cantidad_clientes = 1
             AND (
                -- Solapamiento de fechas
                (NEW.fecha_inicio <= fecha_fin AND NEW.fecha_fin >= fecha_inicio)
                AND
                -- Solapamiento de horarios
                (
                    (NEW.hora_inicio <= hora_fin AND NEW.hora_fin >= hora_inicio)
                    OR
                    (hora_inicio <= NEW.hora_fin AND hora_fin >= NEW.hora_inicio)
                )
             )
            )
        )
        -- Verificar si hay boxes en común
        AND (
            SELECT COUNT(*) > 0
            FROM unnest(NEW.boxes_disponibles) AS box1
            WHERE box1 = ANY(boxes_disponibles)
        )
    ) THEN
        RAISE EXCEPTION 'Ya existe un turno que se solapa con el especificado en el mismo box';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para verificar solapamientos
CREATE TRIGGER check_solapamiento_fechas
    BEFORE INSERT OR UPDATE ON fechas_disponibles
    FOR EACH ROW
    EXECUTE FUNCTION verificar_solapamiento_fechas(); 