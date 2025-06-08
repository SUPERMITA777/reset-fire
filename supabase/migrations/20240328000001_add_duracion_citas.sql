-- Agregar la columna duracion a la tabla citas si no existe
alter table citas
add column if not exists duracion integer;

-- Agregar comentario a la columna
comment on column citas.duracion is 'Duración de la cita en minutos';

-- Crear índice para búsquedas por duración
create index if not exists idx_citas_duracion on citas(duracion); 