-- Agregar el campo estado a la tabla citas
alter table citas 
add column estado text not null default 'reservado' 
check (estado in ('reservado', 'seniado', 'confirmado', 'cancelado'));

-- Actualizar los colores según el estado
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

-- Crear un trigger para actualizar el color automáticamente según el estado
create or replace function update_color_estado()
returns trigger as $$
begin
  new.color := get_color_estado(new.estado);
  return new;
end;
$$ language plpgsql;

create trigger update_color_estado_trigger
  before insert or update on citas
  for each row
  execute function update_color_estado(); 