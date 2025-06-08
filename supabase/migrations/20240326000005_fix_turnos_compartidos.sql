-- Primero eliminar la columna turno_compartido_id de la tabla citas
alter table citas
drop column if exists turno_compartido_id;

-- Eliminar la tabla turnos_citas si existe
drop table if exists turnos_citas;

-- Eliminar la tabla turnos_compartidos si existe
drop table if exists turnos_compartidos;

-- Crear la tabla boxes si no existe
create table if not exists boxes (
  id integer primary key,
  nombre text not null,
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insertar los boxes por defecto si no existen
insert into boxes (id, nombre, descripcion)
select id, 'Box ' || id, 'Box de tratamiento ' || id
from generate_series(1, 8) as id
where not exists (select 1 from boxes where boxes.id = id);

-- Recrear la tabla turnos_compartidos con la estructura correcta
create table turnos_compartidos (
  id uuid primary key default gen_random_uuid(),
  tratamiento_id uuid not null references tratamientos(id) on delete cascade,
  fecha date not null,
  hora_inicio time not null,
  box_id integer not null references boxes(id) on delete cascade,
  max_clientes integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Restricciones
  constraint check_max_clientes check (max_clientes > 0),
  constraint unique_turno_compartido unique (tratamiento_id, fecha, hora_inicio, box_id)
);

-- Agregar columna turno_compartido_id a la tabla citas
alter table citas
add column turno_compartido_id uuid references turnos_compartidos(id) on delete set null;

-- Crear índice para la columna turno_compartido_id
create index if not exists idx_citas_turno_compartido 
  on citas(turno_compartido_id);

-- Crear función para verificar disponibilidad de turnos compartidos
create or replace function verificar_disponibilidad_turno_compartido(
  p_tratamiento_id uuid,
  p_fecha date,
  p_hora_inicio time,
  p_box_id integer
) returns boolean as $$
declare
  v_turno turnos_compartidos;
  v_count integer;
begin
  -- Buscar el turno compartido
  select * into v_turno
  from turnos_compartidos
  where tratamiento_id = p_tratamiento_id
    and fecha = p_fecha
    and hora_inicio = p_hora_inicio
    and box_id = p_box_id;
    
  -- Si no existe el turno, está disponible
  if v_turno is null then
    return true;
  end if;
  
  -- Contar cuántas citas hay en este turno
  select count(*) into v_count
  from citas
  where turno_compartido_id = v_turno.id;
  
  -- Verificar si hay espacio disponible
  return v_count < v_turno.max_clientes;
end;
$$ language plpgsql;

-- Crear función para obtener o crear turno compartido
create or replace function obtener_o_crear_turno_compartido(
  p_tratamiento_id uuid,
  p_fecha date,
  p_hora_inicio time,
  p_box_id integer,
  p_max_clientes integer default 1
) returns uuid as $$
declare
  v_turno_id uuid;
begin
  -- Intentar obtener el turno existente
  select id into v_turno_id
  from turnos_compartidos
  where tratamiento_id = p_tratamiento_id
    and fecha = p_fecha
    and hora_inicio = p_hora_inicio
    and box_id = p_box_id;
    
  -- Si no existe, crearlo
  if v_turno_id is null then
    insert into turnos_compartidos (
      tratamiento_id,
      fecha,
      hora_inicio,
      box_id,
      max_clientes
    ) values (
      p_tratamiento_id,
      p_fecha,
      p_hora_inicio,
      p_box_id,
      p_max_clientes
    )
    returning id into v_turno_id;
  end if;
  
  return v_turno_id;
end;
$$ language plpgsql;

-- Crear función para obtener la disponibilidad de un turno
create or replace function obtener_disponibilidad_turno(
  p_tratamiento_id uuid,
  p_fecha date,
  p_hora_inicio time,
  p_box_id integer
) returns table (
  turno_id uuid,
  cupos_disponibles integer,
  total_cupos integer
) as $$
begin
  return query
  select 
    tc.id as turno_id,
    (tc.max_clientes - count(c.id)) as cupos_disponibles,
    tc.max_clientes as total_cupos
  from turnos_compartidos tc
  left join citas c on c.turno_compartido_id = tc.id
  where tc.tratamiento_id = p_tratamiento_id
    and tc.fecha = p_fecha
    and tc.hora_inicio = p_hora_inicio
    and tc.box_id = p_box_id
  group by tc.id, tc.max_clientes;
end;
$$ language plpgsql;

-- Crear trigger para actualizar updated_at en boxes
create or replace function update_boxes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_boxes_updated_at_trigger on boxes;
create trigger update_boxes_updated_at_trigger
  before update on boxes
  for each row
  execute function update_boxes_updated_at();

-- Crear trigger para actualizar updated_at en turnos_compartidos
create or replace function update_turnos_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_turnos_updated_at_trigger on turnos_compartidos;
create trigger update_turnos_updated_at_trigger
  before update on turnos_compartidos
  for each row
  execute function update_turnos_updated_at();

-- Habilitar RLS
alter table boxes enable row level security;
alter table turnos_compartidos enable row level security;

-- Crear políticas de seguridad para boxes
create policy "Boxes son visibles públicamente"
  on boxes for select
  using (true);

create policy "Usuarios autenticados pueden gestionar boxes"
  on boxes for all
  using (auth.role() = 'authenticated');

-- Crear políticas de seguridad para turnos compartidos
create policy "Turnos compartidos son visibles públicamente"
  on turnos_compartidos for select
  using (true);

create policy "Usuarios autenticados pueden gestionar turnos compartidos"
  on turnos_compartidos for all
  using (auth.role() = 'authenticated');

-- Agregar comentarios a las tablas y columnas
comment on table boxes is 'Tabla para gestionar los boxes de tratamiento';
comment on column boxes.id is 'Identificador único del box';
comment on column boxes.nombre is 'Nombre del box';
comment on column boxes.descripcion is 'Descripción detallada del box';
comment on column boxes.activo is 'Indica si el box está activo';
comment on column boxes.created_at is 'Fecha y hora de creación del registro';
comment on column boxes.updated_at is 'Fecha y hora de última actualización del registro';

comment on table turnos_compartidos is 'Tabla para gestionar turnos compartidos entre múltiples clientes';
comment on column turnos_compartidos.tratamiento_id is 'ID del tratamiento que permite turnos compartidos';
comment on column turnos_compartidos.fecha is 'Fecha del turno compartido';
comment on column turnos_compartidos.hora_inicio is 'Hora de inicio del turno compartido';
comment on column turnos_compartidos.box_id is 'ID del box donde se realiza el turno';
comment on column turnos_compartidos.max_clientes is 'Número máximo de clientes permitidos en este turno';
comment on column turnos_compartidos.created_at is 'Fecha y hora de creación del registro';
comment on column turnos_compartidos.updated_at is 'Fecha y hora de última actualización del registro';

comment on column citas.turno_compartido_id is 'ID del turno compartido al que pertenece esta cita'; 