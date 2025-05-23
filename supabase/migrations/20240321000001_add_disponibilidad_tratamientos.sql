-- Agregar campos de disponibilidad a la tabla tratamientos
alter table tratamientos
add column dias_disponibles jsonb not null default '["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"]'::jsonb,
add column boxes_disponibles integer[] not null default '{1,2,3,4,5,6,7,8}'::integer[],
add column hora_inicio time not null default '08:00'::time,
add column hora_fin time not null default '20:00'::time;

-- Crear una función para verificar si un tratamiento está disponible en una fecha y hora específica
create or replace function verificar_disponibilidad_tratamiento(
  p_tratamiento_id uuid,
  p_fecha date,
  p_hora_inicio time,
  p_hora_fin time,
  p_box_id integer
) returns boolean as $$
declare
  v_dias_disponibles jsonb;
  v_boxes_disponibles integer[];
  v_hora_inicio time;
  v_hora_fin time;
  v_dia_semana text;
begin
  -- Obtener la configuración de disponibilidad del tratamiento
  select 
    dias_disponibles,
    boxes_disponibles,
    hora_inicio,
    hora_fin
  into 
    v_dias_disponibles,
    v_boxes_disponibles,
    v_hora_inicio,
    v_hora_fin
  from tratamientos
  where id = p_tratamiento_id;

  -- Verificar si el día de la semana está disponible
  v_dia_semana := to_char(p_fecha, 'DAY');
  if not (v_dias_disponibles ? upper(v_dia_semana)) then
    return false;
  end if;

  -- Verificar si el box está disponible
  if not (p_box_id = any(v_boxes_disponibles)) then
    return false;
  end if;

  -- Verificar si la hora está dentro del rango disponible
  if p_hora_inicio < v_hora_inicio or p_hora_fin > v_hora_fin then
    return false;
  end if;

  return true;
end;
$$ language plpgsql; 