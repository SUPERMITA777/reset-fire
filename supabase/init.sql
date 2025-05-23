-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- Eliminar tablas existentes si es necesario (descomentar si se necesita reiniciar)
-- drop table if exists citas cascade;
-- drop table if exists sub_tratamientos cascade;
-- drop table if exists tratamientos cascade;
-- drop table if exists clientes cascade;
-- drop table if exists fotos_clientes cascade;

-- Crear tablas
create table if not exists tratamientos (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists clientes (
  id uuid default uuid_generate_v4() primary key,
  dni text unique not null,
  nombre_completo text not null,
  fecha_nacimiento date,
  telefono text,
  email text,
  direccion text,
  historia_clinica jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists sub_tratamientos (
  id uuid default uuid_generate_v4() primary key,
  tratamiento_id uuid references tratamientos(id) on delete cascade,
  nombre text not null,
  duracion integer not null check (duracion > 0),
  precio integer not null check (precio >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists citas (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references clientes(id) on delete set null,
  nombre_completo text not null,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  box_id integer not null check (box_id between 1 and 8),
  tratamiento_id uuid references tratamientos(id) on delete set null,
  sub_tratamiento_id uuid references sub_tratamientos(id) on delete set null,
  color text not null default '#3b82f6',
  observaciones text,
  observaciones_clinicas text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint hora_fin_mayor_inicio check (hora_fin > hora_inicio)
);

create table if not exists fotos_clientes (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references clientes(id) on delete cascade,
  url text not null,
  descripcion text,
  fecha_toma timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index if not exists idx_tratamientos_nombre on tratamientos(nombre);
create index if not exists idx_clientes_nombre on clientes(nombre_completo);
create index if not exists idx_clientes_telefono on clientes(telefono);
create index if not exists idx_clientes_email on clientes(email);
create index if not exists idx_sub_tratamientos_tratamiento on sub_tratamientos(tratamiento_id);
create index if not exists idx_citas_fecha on citas(fecha);
create index if not exists idx_citas_box on citas(box_id);
create index if not exists idx_citas_cliente on citas(cliente_id);
create index if not exists idx_fotos_clientes_cliente on fotos_clientes(cliente_id);

-- Función para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
drop trigger if exists update_tratamientos_updated_at on tratamientos;
create trigger update_tratamientos_updated_at
  before update on tratamientos
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_clientes_updated_at on clientes;
create trigger update_clientes_updated_at
  before update on clientes
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_sub_tratamientos_updated_at on sub_tratamientos;
create trigger update_sub_tratamientos_updated_at
  before update on sub_tratamientos
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_citas_updated_at on citas;
create trigger update_citas_updated_at
  before update on citas
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_fotos_clientes_updated_at on fotos_clientes;
create trigger update_fotos_clientes_updated_at
  before update on fotos_clientes
  for each row
  execute function update_updated_at_column();

-- Habilitar RLS en todas las tablas
alter table tratamientos enable row level security;
alter table clientes enable row level security;
alter table sub_tratamientos enable row level security;
alter table citas enable row level security;
alter table fotos_clientes enable row level security;

-- Políticas de seguridad para tratamientos
drop policy if exists "Tratamientos son visibles públicamente" on tratamientos;
create policy "Tratamientos son visibles públicamente"
  on tratamientos for select
  using (true);

drop policy if exists "Usuarios autenticados pueden gestionar tratamientos" on tratamientos;
create policy "Usuarios autenticados pueden gestionar tratamientos"
  on tratamientos for all
  using (auth.role() = 'authenticated');

-- Políticas de seguridad para clientes
drop policy if exists "Clientes son visibles públicamente" on clientes;
create policy "Clientes son visibles públicamente"
  on clientes for select
  using (true);

drop policy if exists "Usuarios autenticados pueden gestionar clientes" on clientes;
create policy "Usuarios autenticados pueden gestionar clientes"
  on clientes for all
  using (auth.role() = 'authenticated');

-- Políticas de seguridad para sub-tratamientos
drop policy if exists "Sub-tratamientos son visibles públicamente" on sub_tratamientos;
create policy "Sub-tratamientos son visibles públicamente"
  on sub_tratamientos for select
  using (true);

drop policy if exists "Usuarios autenticados pueden gestionar sub-tratamientos" on sub_tratamientos;
create policy "Usuarios autenticados pueden gestionar sub-tratamientos"
  on sub_tratamientos for all
  using (auth.role() = 'authenticated');

-- Políticas de seguridad para citas
drop policy if exists "Citas son visibles públicamente" on citas;
create policy "Citas son visibles públicamente"
  on citas for select
  using (true);

drop policy if exists "Usuarios autenticados pueden gestionar citas" on citas;
create policy "Usuarios autenticados pueden gestionar citas"
  on citas for all
  using (auth.role() = 'authenticated');

-- Políticas de seguridad para fotos_clientes
drop policy if exists "Fotos de clientes son visibles públicamente" on fotos_clientes;
create policy "Fotos de clientes son visibles públicamente"
  on fotos_clientes for select
  using (true);

drop policy if exists "Usuarios autenticados pueden gestionar fotos de clientes" on fotos_clientes;
create policy "Usuarios autenticados pueden gestionar fotos de clientes"
  on fotos_clientes for all
  using (auth.role() = 'authenticated');

-- Configuración del bucket para fotos
insert into storage.buckets (id, name, public)
values ('fotos_clientes', 'fotos_clientes', true)
on conflict (id) do nothing;

-- Políticas de seguridad para el storage
drop policy if exists "Acceso público a fotos" on storage.objects;
create policy "Acceso público a fotos"
  on storage.objects for select
  using (bucket_id = 'fotos_clientes');

drop policy if exists "Usuarios autenticados pueden subir fotos" on storage.objects;
create policy "Usuarios autenticados pueden subir fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'fotos_clientes' 
    and auth.role() = 'authenticated'
  );

drop policy if exists "Usuarios autenticados pueden actualizar fotos" on storage.objects;
create policy "Usuarios autenticados pueden actualizar fotos"
  on storage.objects for update
  using (
    bucket_id = 'fotos_clientes' 
    and auth.role() = 'authenticated'
  );

drop policy if exists "Usuarios autenticados pueden eliminar fotos" on storage.objects;
create policy "Usuarios autenticados pueden eliminar fotos"
  on storage.objects for delete
  using (
    bucket_id = 'fotos_clientes' 
    and auth.role() = 'authenticated'
  );

-- Datos iniciales de ejemplo
insert into tratamientos (nombre)
values 
  ('Depilación láser'),
  ('Tratamiento facial')
on conflict do nothing;

-- Insertar sub-tratamientos de ejemplo
insert into sub_tratamientos (tratamiento_id, nombre, duracion, precio)
select 
  t.id,
  sub.nombre,
  sub.duracion,
  sub.precio
from tratamientos t
cross join (
  values 
    ('Piernas', 60, 8000),
    ('Brazos', 45, 6000),
    ('Axilas', 30, 4000)
) as sub(nombre, duracion, precio)
where t.nombre = 'Depilación láser'
on conflict do nothing;

insert into sub_tratamientos (tratamiento_id, nombre, duracion, precio)
select 
  t.id,
  sub.nombre,
  sub.duracion,
  sub.precio
from tratamientos t
cross join (
  values 
    ('Limpieza profunda', 45, 5500),
    ('Hidratación', 30, 4500)
) as sub(nombre, duracion, precio)
where t.nombre = 'Tratamiento facial'
on conflict do nothing; 