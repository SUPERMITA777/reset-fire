-- Eliminar la columna dias_disponibles de la tabla tratamientos
alter table tratamientos
drop column if exists dias_disponibles;

-- Crear la tabla fechas_disponibles
create table if not exists fechas_disponibles (
    id uuid default gen_random_uuid() primary key,
    tratamiento_id uuid not null references tratamientos(id) on delete cascade,
    fecha_inicio date not null,
    fecha_fin date not null,
    boxes_disponibles integer[] not null default '{1,2,3,4,5,6,7,8}'::integer[],
    hora_inicio time not null default '08:00'::time,
    hora_fin time not null default '20:00'::time,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint fecha_fin_mayor_inicio check (fecha_fin >= fecha_inicio)
);

-- Crear índices
create index if not exists idx_fechas_disponibles_tratamiento on fechas_disponibles(tratamiento_id);
create index if not exists idx_fechas_disponibles_fechas on fechas_disponibles(fecha_inicio, fecha_fin);

-- Crear trigger para actualizar updated_at
create trigger update_fechas_disponibles_updated_at
    before update on fechas_disponibles
    for each row
    execute function update_updated_at_column();

-- Modificar la función verificar_disponibilidad_tratamiento
create or replace function verificar_disponibilidad_tratamiento(
    p_tratamiento_id uuid,
    p_fecha date,
    p_hora_inicio time,
    p_hora_fin time,
    p_box_id integer
) returns boolean as $$
declare
    v_disponible boolean;
    v_hora_inicio_config time;
    v_hora_fin_config time;
    v_boxes_disponibles integer[];
begin
    -- Obtener la configuración de disponibilidad para el tratamiento y fecha
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

    -- Si no hay configuración, retornar false
    if v_hora_inicio_config is null then
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