-- Primero, eliminar horarios existentes para evitar duplicados
DELETE FROM horarios_tratamientos;

-- Crear una tabla temporal con los horarios
CREATE TEMP TABLE horarios_temp (
    hora_inicio time,
    hora_fin time
);

-- Insertar los horarios manualmente
INSERT INTO horarios_temp (hora_inicio, hora_fin) VALUES
    ('08:00', '09:00'),
    ('09:00', '10:00'),
    ('10:00', '11:00'),
    ('11:00', '12:00'),
    ('12:00', '13:00'),
    ('13:00', '14:00'),
    ('14:00', '15:00'),
    ('15:00', '16:00'),
    ('16:00', '17:00'),
    ('17:00', '18:00'),
    ('18:00', '19:00'),
    ('19:00', '20:00');

-- Insertar horarios para todos los tratamientos
INSERT INTO horarios_tratamientos (tratamiento_id, hora_inicio, hora_fin)
SELECT 
    t.id as tratamiento_id,
    h.hora_inicio,
    h.hora_fin
FROM tratamientos t
CROSS JOIN horarios_temp h
ON CONFLICT (tratamiento_id, hora_inicio) DO NOTHING;

-- Eliminar la tabla temporal
DROP TABLE horarios_temp;

-- Verificar que los tratamientos tengan la configuración correcta
UPDATE tratamientos
SET 
    es_compartido = COALESCE(es_compartido, false),
    max_clientes_por_turno = CASE 
        WHEN es_compartido THEN COALESCE(max_clientes_por_turno, 2)
        ELSE 1
    END
WHERE id IN (SELECT DISTINCT tratamiento_id FROM horarios_tratamientos);

-- Asegurar que las fechas disponibles estén configuradas
INSERT INTO fechas_disponibles (
    tratamiento_id,
    fecha_inicio,
    fecha_fin,
    boxes_disponibles,
    hora_inicio,
    hora_fin
)
SELECT 
    t.id,
    CURRENT_DATE,
    CURRENT_DATE + interval '30 days',
    '{1,2,3,4,5,6,7,8}'::integer[],
    '08:00'::time,
    '20:00'::time
FROM tratamientos t
WHERE NOT EXISTS (
    SELECT 1 
    FROM fechas_disponibles fd 
    WHERE fd.tratamiento_id = t.id
    AND CURRENT_DATE BETWEEN fd.fecha_inicio AND fd.fecha_fin
)
ON CONFLICT (tratamiento_id, fecha_inicio) DO NOTHING;

-- Crear una función de ayuda para verificar la configuración
CREATE OR REPLACE FUNCTION verificar_configuracion_tratamiento(p_tratamiento_id UUID)
RETURNS TABLE (
    tiene_horarios BOOLEAN,
    cantidad_horarios INTEGER,
    tiene_fechas_disponibles BOOLEAN,
    es_compartido BOOLEAN,
    max_clientes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM horarios_tratamientos WHERE tratamiento_id = p_tratamiento_id) as tiene_horarios,
        (SELECT COUNT(*) FROM horarios_tratamientos WHERE tratamiento_id = p_tratamiento_id) as cantidad_horarios,
        EXISTS(
            SELECT 1 
            FROM fechas_disponibles 
            WHERE tratamiento_id = p_tratamiento_id 
            AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
        ) as tiene_fechas_disponibles,
        t.es_compartido,
        t.max_clientes_por_turno
    FROM tratamientos t
    WHERE t.id = p_tratamiento_id;
END;
$$ LANGUAGE plpgsql;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION verificar_configuracion_tratamiento TO anon, authenticated;

-- Comentario
COMMENT ON FUNCTION verificar_configuracion_tratamiento IS 'Verifica la configuración de un tratamiento, incluyendo horarios y fechas disponibles'; 