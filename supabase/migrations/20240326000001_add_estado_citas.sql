-- Agregar la columna estado a la tabla citas si no existe
alter table citas
add column if not exists estado text not null default 'reservado'
check (estado in ('reservado', 'seniado', 'confirmado', 'cancelado'));

-- Agregar comentario a la columna
comment on column citas.estado is 'Estado de la cita: reservado, seniado, confirmado o cancelado';

-- Crear o reemplazar la función para obtener el color según el estado
create or replace function get_color_estado(estado text) returns text as $$
begin
  return case estado
    when 'reservado' then '#60a5fa' -- celeste
    when 'seniado' then '#f97316'   -- naranja
    when 'confirmado' then '#22c55e' -- verde
    when 'cancelado' then '#ef4444'  -- rojo
    else '#60a5fa' -- celeste por defecto
  end;
end;
$$ language plpgsql;

-- Crear o reemplazar el trigger para actualizar el color automáticamente según el estado
create or replace function update_color_estado()
returns trigger as $$
begin
  new.color := get_color_estado(new.estado);
  return new;
end;
$$ language plpgsql;

-- Eliminar el trigger si existe
drop trigger if exists update_color_estado_trigger on citas;

-- Crear el trigger
create trigger update_color_estado_trigger
  before insert or update on citas
  for each row
  execute function update_color_estado();

-- Actualizar los colores existentes según su estado
update citas
set color = get_color_estado(estado)
where color is null or color != get_color_estado(estado); 