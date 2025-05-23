-- Modificar la función verificar_disponibilidad_tratamiento
create or replace function verificar_disponibilidad_tratamiento(
    p_tratamiento_id uuid,
    p_fecha date,
    p_hora_inicio time,
    p_hora_fin time,
    p_box_id integer
) returns boolean as $$
declare
    v_hora_inicio_config time;
    v_hora_fin_config time;
    v_boxes_disponibles integer[];
begin
    -- Primero verificar si hay una configuración de fechas disponible para el tratamiento
    select 
        hora_inicio,
        hora_fin,
        boxes_disponibles
    into 
        v_hora_inicio_config,
        v_hora_fin_config,
        v_boxes_disponibles
    from fechas_disponibles
    where tratamiento_id = p_tratamiento_id
    and p_fecha between fecha_inicio and fecha_fin
    limit 1;

    -- Si no hay configuración de fechas, retornar false
    if v_hora_inicio_config is null then
        return false;
    end if;

    -- Verificar si el box está disponible
    if not (p_box_id = any(v_boxes_disponibles)) then
        return false;
    end if;

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

        -- Verificar que el horario solicitado esté dentro del rango configurado
        return v_minutos_inicio_solicitado >= v_minutos_inicio_config 
               and v_minutos_fin_solicitado <= v_minutos_fin_config;
    end;
end;
$$ language plpgsql; 