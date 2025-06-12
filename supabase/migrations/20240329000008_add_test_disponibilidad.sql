-- Insertar datos de prueba en rf_disponibilidad
INSERT INTO rf_disponibilidad (
    tratamiento_id,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_fin,
    boxes_disponibles,
    cantidad_clientes
)
SELECT 
    t.id as tratamiento_id,
    CURRENT_DATE as fecha_inicio,
    CURRENT_DATE + interval '30 days' as fecha_fin,
    '08:00'::time as hora_inicio,
    '20:00'::time as hora_fin,
    ARRAY[1,2,3,4,5,6,7,8] as boxes_disponibles,
    1 as cantidad_clientes
FROM rf_tratamientos t
WHERE NOT EXISTS (
    SELECT 1 
    FROM rf_disponibilidad d
    WHERE d.tratamiento_id = t.id
    AND CURRENT_DATE BETWEEN d.fecha_inicio AND d.fecha_fin
);

-- Comentario explicativo
COMMENT ON TABLE rf_disponibilidad IS 'Tabla para gestionar la disponibilidad de horarios de los tratamientos de Reset Fire'; 