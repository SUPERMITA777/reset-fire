-- Eliminar la tabla citas si existe
drop table if exists citas cascade;

-- Crear la tabla citas con todos los campos necesarios
create table citas (
    id uuid default gen_random_uuid() primary key,
    nombre_completo text not null,
    dni text,
    whatsapp text,
    fecha date not null,
    hora_inicio time not null,
    hora_fin time not null,
    box_id integer not null check (box_id between 1 and 8),
    tratamiento_id uuid not null references tratamientos(id) on delete restrict,
    sub_tratamiento_id uuid not null references sub_tratamientos(id) on delete restrict,
    color text not null default '#4f46e5',
    duracion integer, -- duración en minutos
    precio decimal(10,2), -- precio en pesos
    senia decimal(10,2) default 0, -- seña en pesos
    observaciones text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índices para mejorar el rendimiento
create index citas_fecha_idx on citas(fecha);
create index citas_box_id_idx on citas(box_id);
create index citas_tratamiento_id_idx on citas(tratamiento_id);
create index citas_sub_tratamiento_id_idx on citas(sub_tratamiento_id);

-- Crear función para actualizar el updated_at automáticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Crear trigger para actualizar updated_at
create trigger update_citas_updated_at
    before update on citas
    for each row
    execute function update_updated_at_column();

-- Agregar comentarios a la tabla y columnas
comment on table citas is 'Tabla que almacena las citas de los clientes';
comment on column citas.id is 'Identificador único de la cita';
comment on column citas.nombre_completo is 'Nombre completo del cliente';
comment on column citas.dni is 'DNI del cliente';
comment on column citas.whatsapp is 'Número de WhatsApp del cliente';
comment on column citas.fecha is 'Fecha de la cita';
comment on column citas.hora_inicio is 'Hora de inicio de la cita';
comment on column citas.hora_fin is 'Hora de fin de la cita';
comment on column citas.box_id is 'Número de box (1-8)';
comment on column citas.tratamiento_id is 'ID del tratamiento seleccionado';
comment on column citas.sub_tratamiento_id is 'ID del sub-tratamiento seleccionado';
comment on column citas.color is 'Color para identificar la cita en el calendario';
comment on column citas.duracion is 'Duración del tratamiento en minutos';
comment on column citas.precio is 'Precio del tratamiento en pesos';
comment on column citas.senia is 'Monto de la seña en pesos';
comment on column citas.observaciones is 'Observaciones adicionales de la cita';
comment on column citas.created_at is 'Fecha y hora de creación del registro';
comment on column citas.updated_at is 'Fecha y hora de última actualización del registro';

-- Habilitar RLS (Row Level Security)
alter table citas enable row level security;

-- Crear políticas de seguridad
create policy "Permitir todas las operaciones en citas"
on citas
for all
using (true)
with check (true);

-- Política para permitir acceso anónimo
create policy "Permitir acceso anónimo a citas"
on citas
for all
to anon
using (true)
with check (true);

-- Política para permitir acceso autenticado
create policy "Permitir acceso autenticado a citas"
on citas
for all
to authenticated
using (true)
with check (true); 