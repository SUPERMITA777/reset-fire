-- Crear la tabla turnos_compartidos si no existe
create table if not exists turnos_compartidos (
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

-- Agregar comentarios
comment on table turnos_compartidos is 'Tabla para manejar turnos compartidos entre múltiples clientes';
comment on column turnos_compartidos.tratamiento_id is 'ID del tratamiento que permite turnos compartidos';
comment on column turnos_compartidos.fecha is 'Fecha del turno compartido';
comment on column turnos_compartidos.hora_inicio is 'Hora de inicio del turno compartido';
comment on column turnos_compartidos.box_id is 'ID del box donde se realiza el turno';
comment on column turnos_compartidos.max_clientes is 'Número máximo de clientes permitidos en este turno';

-- Crear índices
create index if not exists idx_turnos_compartidos_tratamiento 
  on turnos_compartidos(tratamiento_id);
create index if not exists idx_turnos_compartidos_fecha 
  on turnos_compartidos(fecha);
create index if not exists idx_turnos_compartidos_box 
  on turnos_compartidos(box_id);

-- Crear función para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Crear trigger para actualizar updated_at
drop trigger if exists update_turnos_compartidos_updated_at on turnos_compartidos;
create trigger update_turnos_compartidos_updated_at
  before update on turnos_compartidos
  for each row
  execute function update_updated_at_column();

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

-- Agregar columna turno_compartido_id a la tabla citas si no existe
alter table citas
add column if not exists turno_compartido_id uuid references turnos_compartidos(id) on delete set null;

-- Crear índice para la nueva columna
create index if not exists idx_citas_turno_compartido 
  on citas(turno_compartido_id); 