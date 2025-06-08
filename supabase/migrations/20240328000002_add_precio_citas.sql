-- Agregar la columna precio a la tabla citas si no existe
alter table citas
add column if not exists precio decimal(10,2);

-- Agregar comentario a la columna
comment on column citas.precio is 'Precio de la cita';

-- Crear índice para búsquedas por precio
create index if not exists idx_citas_precio on citas(precio); 