-- Primero, asegurarnos de que el tratamiento tenga horarios
INSERT INTO horarios_tratamientos (tratamiento_id, hora_inicio, hora_fin)
SELECT 
    '7cb1b9ca-1643-4aa8-b759-4f05a74e6599'::uuid,
    hora_inicio,
    hora_fin
FROM (
    VALUES 
        ('08:00'::time, '09:00'::time),
        ('09:00'::time, '10:00'::time),
        ('10:00'::time, '11:00'::time),
        ('11:00'::time, '12:00'::time),
        ('12:00'::time, '13:00'::time),
        ('13:00'::time, '14:00'::time),
        ('14:00'::time, '15:00'::time),
        ('15:00'::time, '16:00'::time),
        ('16:00'::time, '17:00'::time),
        ('17:00'::time, '18:00'::time),
        ('18:00'::time, '19:00'::time),
        ('19:00'::time, '20:00'::time)
) AS horas(hora_inicio, hora_fin)
WHERE NOT EXISTS (
    SELECT 1 
    FROM horarios_tratamientos 
    WHERE tratamiento_id = '7cb1b9ca-1643-4aa8-b759-4f05a74e6599'::uuid
);

-- Luego, asegurarnos de que tenga fechas disponibles
INSERT INTO fechas_disponibles (
    tratamiento_id,
    fecha_inicio,
    fecha_fin,
    boxes_disponibles,
    hora_inicio,
    hora_fin
)
SELECT 
    '7cb1b9ca-1643-4aa8-b759-4f05a74e6599'::uuid,
    CURRENT_DATE,
    CURRENT_DATE + interval '30 days',
    '{1,2,3,4,5,6,7,8}'::integer[],
    '08:00'::time,
    '20:00'::time
WHERE NOT EXISTS (
    SELECT 1 
    FROM fechas_disponibles 
    WHERE tratamiento_id = '7cb1b9ca-1643-4aa8-b759-4f05a74e6599'::uuid
    AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
);

-- Actualizar la configuración del tratamiento
UPDATE tratamientos
SET 
    es_compartido = COALESCE(es_compartido, false),
    max_clientes_por_turno = CASE 
        WHEN es_compartido THEN COALESCE(max_clientes_por_turno, 2)
        ELSE 1
    END
WHERE id = '7cb1b9ca-1643-4aa8-b759-4f05a74e6599'::uuid; 