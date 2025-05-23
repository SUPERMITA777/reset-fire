-- Eliminar configuraciones duplicadas para mayo 2025
delete from fechas_disponibles
where tratamiento_id = 'dffc3c9b-ffd0-472c-bf0f-b0e8d739755d'
and fecha_inicio >= '2025-05-01'
and fecha_fin <= '2025-05-31';

-- Insertar la configuración correcta para mayo 2025
insert into fechas_disponibles (
    tratamiento_id,
    fecha_inicio,
    fecha_fin,
    boxes_disponibles,
    hora_inicio,
    hora_fin
) values (
    'dffc3c9b-ffd0-472c-bf0f-b0e8d739755d',
    '2025-05-01',
    '2025-05-31',
    '{1,2,3,4,5,6,7,8}'::integer[],
    '08:00'::time,
    '20:00'::time
); 