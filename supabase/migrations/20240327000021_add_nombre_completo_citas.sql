-- Agregar la columna nombre_completo a la tabla citas si no existe
alter table citas
add column if not exists nombre_completo text;

-- Agregar comentario a la columna
comment on column citas.nombre_completo is 'Nombre completo del cliente';

-- Crear índice para búsquedas por nombre
create index if not exists idx_citas_nombre_completo on citas(nombre_completo);

-- Actualizar las citas existentes que no tengan nombre_completo
update citas
set nombre_completo = 'Cliente sin nombre'
where nombre_completo is null;

-- Hacer la columna not null después de actualizar los valores existentes
alter table citas
alter column nombre_completo set not null; 