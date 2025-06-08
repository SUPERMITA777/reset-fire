-- Configurar permisos para las funciones RPC

-- Permitir acceso público a la función verificar_disponibilidad_turno_compartido
grant execute on function verificar_disponibilidad_turno_compartido(uuid, date, time, integer) to anon, authenticated;

-- Permitir acceso público a la función obtener_o_crear_turno_compartido
grant execute on function obtener_o_crear_turno_compartido(uuid, date, time, integer, integer) to anon, authenticated;

-- Permitir acceso público a la función obtener_disponibilidad_turno
grant execute on function obtener_disponibilidad_turno(uuid, date, time, integer) to anon, authenticated;

-- Crear políticas de seguridad para las funciones RPC
create policy "Permitir acceso público a verificar_disponibilidad_turno_compartido"
  on turnos_compartidos
  for select
  using (true);

create policy "Permitir acceso público a obtener_o_crear_turno_compartido"
  on turnos_compartidos
  for insert
  with check (true);

create policy "Permitir acceso público a obtener_disponibilidad_turno"
  on turnos_compartidos
  for select
  using (true);

-- Asegurarnos de que las funciones sean accesibles públicamente
alter function verificar_disponibilidad_turno_compartido(uuid, date, time, integer) security definer;
alter function obtener_o_crear_turno_compartido(uuid, date, time, integer, integer) security definer;
alter function obtener_disponibilidad_turno(uuid, date, time, integer) security definer;

-- Comentarios para las funciones
comment on function verificar_disponibilidad_turno_compartido(uuid, date, time, integer) is 'Verifica si hay disponibilidad en un turno compartido';
comment on function obtener_o_crear_turno_compartido(uuid, date, time, integer, integer) is 'Obtiene un turno compartido existente o crea uno nuevo';
comment on function obtener_disponibilidad_turno(uuid, date, time, integer) is 'Obtiene información detallada sobre la disponibilidad de un turno'; 