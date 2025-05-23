-- Habilitar RLS en todas las tablas
alter table tratamientos enable row level security;
alter table sub_tratamientos enable row level security;
alter table citas enable row level security;

-- Políticas para tratamientos
create policy "Permitir todas las operaciones en tratamientos"
on tratamientos
for all
using (true)
with check (true);

-- Políticas para sub_tratamientos
create policy "Permitir todas las operaciones en sub_tratamientos"
on sub_tratamientos
for all
using (true)
with check (true);

-- Políticas para citas
create policy "Permitir todas las operaciones en citas"
on citas
for all
using (true)
with check (true);

-- Política para permitir acceso anónimo (necesario para la aplicación)
create policy "Permitir acceso anónimo a tratamientos"
on tratamientos
for all
to anon
using (true)
with check (true);

create policy "Permitir acceso anónimo a sub_tratamientos"
on sub_tratamientos
for all
to anon
using (true)
with check (true);

create policy "Permitir acceso anónimo a citas"
on citas
for all
to anon
using (true)
with check (true);

-- Política para permitir acceso autenticado
create policy "Permitir acceso autenticado a tratamientos"
on tratamientos
for all
to authenticated
using (true)
with check (true);

create policy "Permitir acceso autenticado a sub_tratamientos"
on sub_tratamientos
for all
to authenticated
using (true)
with check (true);

create policy "Permitir acceso autenticado a citas"
on citas
for all
to authenticated
using (true)
with check (true); 