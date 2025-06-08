-- Eliminar la restricción única existente
ALTER TABLE fechas_disponibles
DROP CONSTRAINT IF EXISTS unique_fecha_tratamiento;

-- Crear una función para verificar solapamientos de horarios
CREATE OR REPLACE FUNCTION verificar_solapamiento_horarios()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si existe algún solapamiento con las fechas y horarios existentes
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
        AND (
            -- Verificar solapamiento de horarios
            (hora_inicio <= NEW.hora_inicio AND hora_fin > NEW.hora_inicio)
            OR
            (hora_inicio < NEW.hora_fin AND hora_fin >= NEW.hora_fin)
            OR
            (hora_inicio >= NEW.hora_inicio AND hora_fin <= NEW.hora_fin)
        )
    ) THEN
        RAISE EXCEPTION 'Ya existe un horario que se solapa con el especificado para estas fechas';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para verificar solapamientos
DROP TRIGGER IF EXISTS check_solapamiento_horarios ON fechas_disponibles;
CREATE TRIGGER check_solapamiento_horarios
    BEFORE INSERT OR UPDATE ON fechas_disponibles
    FOR EACH ROW
    EXECUTE FUNCTION verificar_solapamiento_horarios();

-- Modificar la función verificar_disponibilidad_tratamiento para manejar múltiples horarios
CREATE OR REPLACE FUNCTION verificar_disponibilidad_tratamiento(
    p_tratamiento_id uuid,
    p_fecha date,
    p_hora_inicio time,
    p_hora_fin time,
    p_box_id integer
) returns boolean as $$
declare
    v_disponible boolean := false;
    v_hora_inicio_config time;
    v_hora_fin_config time;
    v_boxes_disponibles integer[];
begin
    -- Buscar todas las configuraciones disponibles para la fecha
    for v_hora_inicio_config, v_hora_fin_config, v_boxes_disponibles in
        select 
            hora_inicio,
            hora_fin,
            boxes_disponibles
        from fechas_disponibles
        where tratamiento_id = p_tratamiento_id
        and p_fecha between fecha_inicio and fecha_fin
        and p_box_id = any(boxes_disponibles)
    loop
        -- Convertir las horas a minutos para una comparación más precisa
        declare
            v_minutos_inicio_config integer;
            v_minutos_fin_config integer;
            v_minutos_inicio_solicitado integer;
            v_minutos_fin_solicitado integer;
        begin
            v_minutos_inicio_config := extract(hour from v_hora_inicio_config) * 60 + extract(minute from v_hora_inicio_config);
            v_minutos_fin_config := extract(hour from v_hora_fin_config) * 60 + extract(minute from v_hora_fin_config);
            v_minutos_inicio_solicitado := extract(hour from p_hora_inicio) * 60 + extract(minute from p_hora_inicio);
            v_minutos_fin_solicitado := extract(hour from p_hora_fin) * 60 + extract(minute from p_hora_fin);

            -- Verificar si el horario solicitado está dentro del rango configurado
            if v_minutos_inicio_solicitado >= v_minutos_inicio_config 
               and v_minutos_fin_solicitado <= v_minutos_fin_config then
                v_disponible := true;
                exit; -- Salir del loop si encontramos un horario disponible
            end if;
        end;
    end loop;

    return v_disponible;
end;
$$ language plpgsql;

-- Crear una función para obtener todos los horarios disponibles en una fecha
CREATE OR REPLACE FUNCTION obtener_horarios_disponibles_fecha(
    p_tratamiento_id uuid,
    p_fecha date,
    p_box_id integer
) RETURNS TABLE (
    hora_inicio time,
    hora_fin time,
    boxes_disponibles integer[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fd.hora_inicio,
        fd.hora_fin,
        fd.boxes_disponibles
    FROM fechas_disponibles fd
    WHERE fd.tratamiento_id = p_tratamiento_id
    AND p_fecha BETWEEN fd.fecha_inicio AND fd.fecha_fin
    AND p_box_id = ANY(fd.boxes_disponibles)
    ORDER BY fd.hora_inicio;
END;
$$ LANGUAGE plpgsql; 