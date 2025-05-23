-- Función para crear la tabla tratamientos
create or replace function crear_tabla_tratamientos()
returns void
language plpgsql
security definer
as $$
begin
  -- Crear la tabla si no existe
  create table if not exists tratamientos (
    id uuid primary key default gen_random_uuid(),
    nombre text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Crear índices
  create index if not exists idx_tratamientos_nombre on tratamientos(nombre);
  create index if not exists idx_tratamientos_created_at on tratamientos(created_at);
end;
$$;

-- Función para crear la tabla sub_tratamientos
create or replace function crear_tabla_sub_tratamientos()
returns void
language plpgsql
security definer
as $$
begin
  -- Crear la tabla si no existe
  create table if not exists sub_tratamientos (
    id uuid primary key default gen_random_uuid(),
    tratamiento_id uuid not null references tratamientos(id) on delete cascade,
    nombre text not null,
    duracion integer not null check (duracion > 0),
    precio numeric(10,2) not null check (precio >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(tratamiento_id, nombre)
  );

  -- Crear índices
  create index if not exists idx_sub_tratamientos_tratamiento_id on sub_tratamientos(tratamiento_id);
  create index if not exists idx_sub_tratamientos_nombre on sub_tratamientos(nombre);
  create index if not exists idx_sub_tratamientos_created_at on sub_tratamientos(created_at);
end;
$$;

-- Función para crear la tabla citas
create or replace function crear_tabla_citas()
returns void
language plpgsql
security definer
as $$
begin
  -- Crear la tabla si no existe
  create table if not exists citas (
    id uuid primary key default gen_random_uuid(),
    nombre_completo text not null,
    fecha date not null,
    hora_inicio time not null,
    hora_fin time not null,
    box_id integer not null check (box_id between 1 and 8),
    tratamiento_id uuid not null references tratamientos(id),
    sub_tratamiento_id uuid not null references sub_tratamientos(id),
    color text not null default '#4f46e5',
    observaciones text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    check (hora_inicio < hora_fin)
  );

  -- Crear índices
  create index if not exists idx_citas_fecha on citas(fecha);
  create index if not exists idx_citas_box_id on citas(box_id);
  create index if not exists idx_citas_tratamiento_id on citas(tratamiento_id);
  create index if not exists idx_citas_sub_tratamiento_id on citas(sub_tratamiento_id);
  create index if not exists idx_citas_created_at on citas(created_at);

  -- Crear índice compuesto para búsquedas de disponibilidad
  create index if not exists idx_citas_fecha_box_hora 
    on citas(fecha, box_id, hora_inicio, hora_fin);
end;
$$;

-- Trigger para actualizar updated_at
create or replace function actualizar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Crear triggers para actualizar updated_at
create trigger actualizar_tratamientos_updated_at
  before update on tratamientos
  for each row
  execute function actualizar_updated_at();

create trigger actualizar_sub_tratamientos_updated_at
  before update on sub_tratamientos
  for each row
  execute function actualizar_updated_at();

create trigger actualizar_citas_updated_at
  before update on citas
  for each row
  execute function actualizar_updated_at(); 