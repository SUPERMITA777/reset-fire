-- Agregar la columna whatsapp a la tabla citas si no existe
alter table citas
add column if not exists whatsapp text;

-- Agregar comentario a la columna
comment on column citas.whatsapp is 'Número de WhatsApp del cliente para la cita';

-- Agregar restricción para validar el formato del número de WhatsApp
alter table citas
add constraint check_whatsapp_format
check (whatsapp is null or whatsapp ~ '^\+?[0-9]{10,15}$');

-- Crear índice para búsquedas por WhatsApp
create index if not exists idx_citas_whatsapp on citas(whatsapp);

-- Crear función para formatear número de WhatsApp
create or replace function format_whatsapp_number(whatsapp text) returns text as $$
begin
  -- Si es nulo, retornar nulo
  if whatsapp is null then
    return null;
  end if;
  
  -- Remover caracteres no numéricos
  whatsapp := regexp_replace(whatsapp, '[^0-9]', '', 'g');
  
  -- Si empieza con 54, removerlo
  if length(whatsapp) > 10 and left(whatsapp, 2) = '54' then
    whatsapp := right(whatsapp, -2);
  end if;
  
  -- Si empieza con 9, removerlo
  if length(whatsapp) > 10 and left(whatsapp, 1) = '9' then
    whatsapp := right(whatsapp, -1);
  end if;
  
  -- Asegurar que tenga el formato correcto
  if length(whatsapp) = 10 then
    return '+54' || whatsapp;
  end if;
  
  return whatsapp;
end;
$$ language plpgsql;

-- Crear trigger para formatear el número de WhatsApp automáticamente
create or replace function format_whatsapp_trigger()
returns trigger as $$
begin
  new.whatsapp := format_whatsapp_number(new.whatsapp);
  return new;
end;
$$ language plpgsql;

-- Eliminar el trigger si existe
drop trigger if exists format_whatsapp_trigger on citas;

-- Crear el trigger
create trigger format_whatsapp_trigger
  before insert or update on citas
  for each row
  execute function format_whatsapp_trigger();

-- Actualizar los números de WhatsApp existentes
update citas
set whatsapp = format_whatsapp_number(whatsapp)
where whatsapp is not null; 