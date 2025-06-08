-- Insertar horarios por defecto para todos los tratamientos que no tengan horarios configurados
INSERT INTO horarios_tratamientos (tratamiento_id, hora_inicio, hora_fin)
SELECT 
  t.id,
  hora_inicio,
  hora_fin
FROM tratamientos t
CROSS JOIN (
  SELECT 
    hora_inicio::time,
    (hora_inicio + interval '1 hour')::time as hora_fin
  FROM generate_series(
    '08:00'::time,
    '19:00'::time,
    '1 hour'::interval
  ) hora_inicio
) horas
WHERE NOT EXISTS (
  SELECT 1 
  FROM horarios_tratamientos ht 
  WHERE ht.tratamiento_id = t.id
)
ON CONFLICT (tratamiento_id, hora_inicio) DO NOTHING; 