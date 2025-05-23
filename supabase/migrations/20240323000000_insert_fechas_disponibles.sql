-- Insertar fechas disponibles para los tratamientos existentes
insert into fechas_disponibles (tratamiento_id, fecha_inicio, fecha_fin, boxes_disponibles, hora_inicio, hora_fin)
select 
  t.id,
  current_date,
  current_date + interval '30 days',
  '{1,2,3,4,5,6,7,8}'::integer[],
  '08:00'::time,
  '20:00'::time
from tratamientos t
where not exists (
  select 1 
  from fechas_disponibles fd 
  where fd.tratamiento_id = t.id
); 