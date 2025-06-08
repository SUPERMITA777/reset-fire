-- Asegurar que el tratamiento tenga fechas disponibles configuradas
INSERT INTO fechas_disponibles (
    tratamiento_id,
    fecha_inicio,
    fecha_fin,
    boxes_disponibles,
    hora_inicio,
    hora_fin,
    cantidad_clientes
)
SELECT 
    t.id,
    CURRENT_DATE,
    CURRENT_DATE + interval '30 days',
    COALESCE(t.boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]),
    COALESCE(t.hora_inicio, '08:00'::time),
    COALESCE(t.hora_fin, '20:00'::time),
    CASE 
        WHEN t.es_compartido THEN COALESCE(t.max_clientes_por_turno, 2)
        ELSE 1
    END
FROM tratamientos t
WHERE t.id = 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c'::uuid
AND NOT EXISTS (
    SELECT 1 
    FROM fechas_disponibles fd 
    WHERE fd.tratamiento_id = t.id
    AND CURRENT_DATE BETWEEN fd.fecha_inicio AND fd.fecha_fin
);

-- Verificar que se insertaron las fechas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM fechas_disponibles 
        WHERE tratamiento_id = 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c'::uuid
        AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
    ) THEN
        RAISE EXCEPTION 'No se pudieron configurar las fechas disponibles para el tratamiento';
    END IF;
END $$; 