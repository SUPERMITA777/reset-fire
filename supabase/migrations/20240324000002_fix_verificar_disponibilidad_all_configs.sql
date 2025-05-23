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
    v_config_encontrada boolean := false;
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
    loop
        -- Verificar si el box está disponible en esta configuración
        if p_box_id = any(v_boxes_disponibles) then
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
                if v_minutos_inicio_solicitado >= v_minutos_inicio_config 
                   and v_minutos_fin_solicitado <= v_minutos_fin_config then
                    v_config_encontrada := true;
                    exit; -- Salir del loop si encontramos una configuración válida
                end if;
            end;
        end if;
    end loop;

    return v_config_encontrada;
end;
$$ language plpgsql; 