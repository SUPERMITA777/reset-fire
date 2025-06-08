-- Agregar campo max_clientes_por_turno a la tabla tratamientos
alter table tratamientos
  add column if not exists max_clientes_por_turno integer not null default 1
  check (max_clientes_por_turno > 0);

-- Crear tabla para gestionar los turnos compartidos
create table if not exists turnos_compartidos (
    id uuid primary key default gen_random_uuid(),
    tratamiento_id uuid not null references tratamientos(id) on delete cascade,
    fecha date not null,
    hora_inicio time not null,
    hora_fin time not null,
    box_id integer not null check (box_id between 1 and 8),
    max_clientes integer not null check (max_clientes > 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint hora_fin_mayor_inicio check (hora_fin > hora_inicio),
    constraint turno_unico unique (tratamiento_id, fecha, hora_inicio, box_id)
);

-- Crear tabla para la relación entre turnos compartidos y citas
create table if not exists turnos_citas (
    turno_id uuid not null references turnos_compartidos(id) on delete cascade,
    cita_id uuid not null references citas(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (turno_id, cita_id)
);

-- Crear índices para mejorar el rendimiento
create index if not exists idx_turnos_compartidos_fecha on turnos_compartidos(fecha);
create index if not exists idx_turnos_compartidos_box on turnos_compartidos(box_id);
create index if not exists idx_turnos_compartidos_tratamiento on turnos_compartidos(tratamiento_id);
create index if not exists idx_turnos_citas_turno on turnos_citas(turno_id);
create index if not exists idx_turnos_citas_cita on turnos_citas(cita_id);

-- Función para verificar la disponibilidad de cupos en un turno
create or replace function verificar_cupos_turno()
returns trigger as $$
declare
    cupos_disponibles integer;
begin
    -- Obtener la cantidad de cupos disponibles
    select (tc.max_clientes - count(tc2.cita_id))
    into cupos_disponibles
    from turnos_compartidos tc
    left join turnos_citas tc2 on tc2.turno_id = tc.id
    where tc.id = new.turno_id
    group by tc.max_clientes;

    -- Verificar si hay cupos disponibles
    if cupos_disponibles <= 0 then
        raise exception 'No hay cupos disponibles para este turno';
    end if;

    return new;
end;
$$ language plpgsql;

-- Crear trigger para verificar cupos
drop trigger if exists verificar_cupos_turno_trigger on turnos_citas;
create trigger verificar_cupos_turno_trigger
    before insert on turnos_citas
    for each row
    execute function verificar_cupos_turno();

-- Función para actualizar el updated_at
create or replace function update_turnos_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Crear trigger para actualizar updated_at
drop trigger if exists update_turnos_updated_at_trigger on turnos_compartidos;
create trigger update_turnos_updated_at_trigger
    before update on turnos_compartidos
    for each row
    execute function update_turnos_updated_at();

-- Agregar comentarios
comment on column tratamientos.max_clientes_por_turno is 'Número máximo de clientes que pueden asistir al mismo tiempo a este tratamiento';
comment on table turnos_compartidos is 'Tabla que gestiona los turnos compartidos para tratamientos grupales';
comment on column turnos_compartidos.max_clientes is 'Número máximo de clientes permitidos en este turno específico';
comment on table turnos_citas is 'Tabla que relaciona los turnos compartidos con las citas individuales';

-- Habilitar RLS
alter table turnos_compartidos enable row level security;
alter table turnos_citas enable row level security;

-- Crear políticas de seguridad
create policy "Turnos compartidos son visibles públicamente"
    on turnos_compartidos for select
    using (true);

create policy "Usuarios autenticados pueden gestionar turnos compartidos"
    on turnos_compartidos for all
    using (auth.role() = 'authenticated');

create policy "Turnos-citas son visibles públicamente"
    on turnos_citas for select
    using (true);

create policy "Usuarios autenticados pueden gestionar turnos-citas"
    on turnos_citas for all
    using (auth.role() = 'authenticated');

-- Función para obtener la disponibilidad de un turno
create or replace function obtener_disponibilidad_turno(
    p_tratamiento_id uuid,
    p_fecha date,
    p_hora_inicio time,
    p_box_id integer
)
returns table (
    turno_id uuid,
    cupos_disponibles integer,
    total_cupos integer
) as $$
begin
    return query
    select 
        tc.id as turno_id,
        (tc.max_clientes - count(tc2.cita_id)) as cupos_disponibles,
        tc.max_clientes as total_cupos
    from turnos_compartidos tc
    left join turnos_citas tc2 on tc2.turno_id = tc.id
    where tc.tratamiento_id = p_tratamiento_id
        and tc.fecha = p_fecha
        and tc.hora_inicio = p_hora_inicio
        and tc.box_id = p_box_id
    group by tc.id, tc.max_clientes;
end;
$$ language plpgsql; 