-- Primero eliminamos la función si existe
drop function if exists verificar_disponibilidad_tratamiento;

-- Luego la recreamos con los tipos correctos
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
  where id = p_tratamiento_id::uuid;  -- Aseguramos la conversión explícita a UUID

  -- Si no se encuentra el tratamiento, retornar false
  if v_dias_disponibles is null then
    return false;
  end if;

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

-- Verificar que la función se creó correctamente
do $$
begin
  if not exists (
    select 1 
    from pg_proc 
    where proname = 'verificar_disponibilidad_tratamiento'
  ) then
    raise exception 'La función verificar_disponibilidad_tratamiento no se creó correctamente';
  end if;
end $$; 