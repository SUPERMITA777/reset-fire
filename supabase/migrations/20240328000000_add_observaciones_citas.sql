-- Agregar la columna observaciones a la tabla citas si no existe
alter table citas
add column if not exists observaciones text;

-- Agregar comentario a la columna
comment on column citas.observaciones is 'Observaciones adicionales de la cita';

-- Crear índice para búsquedas por observaciones
create index if not exists idx_citas_observaciones on citas(observaciones); 