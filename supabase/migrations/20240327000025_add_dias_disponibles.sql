-- Agregar la columna dias_disponibles a la tabla tratamientos
ALTER TABLE tratamientos
ADD COLUMN IF NOT EXISTS dias_disponibles JSONB NOT NULL DEFAULT '["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"]'::jsonb;

-- Agregar comentario a la columna
COMMENT ON COLUMN tratamientos.dias_disponibles IS 'Días de la semana en los que el tratamiento está disponible';

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tratamientos_dias_disponibles ON tratamientos USING gin (dias_disponibles);

-- Actualizar la migración anterior para que no intente actualizar dias_disponibles
CREATE OR REPLACE FUNCTION fix_tratamientos_config() RETURNS void AS $$
BEGIN
    UPDATE tratamientos
    SET 
        es_compartido = COALESCE(es_compartido, false),
        max_clientes_por_turno = CASE 
            WHEN es_compartido THEN COALESCE(max_clientes_por_turno, 2)
            ELSE 1
        END,
        boxes_disponibles = COALESCE(boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]),
        hora_inicio = COALESCE(hora_inicio, '08:00'::time),
        hora_fin = COALESCE(hora_fin, '20:00'::time);
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función
SELECT fix_tratamientos_config();

-- Eliminar la función temporal
DROP FUNCTION fix_tratamientos_config();

-- Asegurar que los tratamientos tengan la configuración correcta
UPDATE tratamientos
SET 
    es_compartido = COALESCE(es_compartido, false),
    max_clientes_por_turno = CASE 
        WHEN es_compartido THEN COALESCE(max_clientes_por_turno, 2)
        ELSE 1
    END,
    boxes_disponibles = COALESCE(boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]),
    hora_inicio = COALESCE(hora_inicio, '08:00'::time),
    hora_fin = COALESCE(hora_fin, '20:00'::time);

-- Asegurar que todos los tratamientos tengan horarios configurados
INSERT INTO horarios_tratamientos (tratamiento_id, hora_inicio, hora_fin)
SELECT 
    t.id as tratamiento_id,
    h.hora_inicio::time,
    h.hora_fin::time
FROM tratamientos t
CROSS JOIN (
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
) AS h(hora_inicio, hora_fin)
WHERE NOT EXISTS (
    SELECT 1 
    FROM horarios_tratamientos ht 
    WHERE ht.tratamiento_id = t.id
)
ON CONFLICT (tratamiento_id, hora_inicio) DO NOTHING;

-- Asegurar que todos los tratamientos tengan fechas disponibles configuradas
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
    t.boxes_disponibles,
    t.hora_inicio,
    t.hora_fin
FROM tratamientos t
WHERE NOT EXISTS (
    SELECT 1 
    FROM fechas_disponibles fd 
    WHERE fd.tratamiento_id = t.id
    AND CURRENT_DATE BETWEEN fd.fecha_inicio AND fd.fecha_fin
)
ON CONFLICT (tratamiento_id, fecha_inicio) DO NOTHING;

-- Crear una función de ayuda para verificar la configuración completa
CREATE OR REPLACE FUNCTION verificar_configuracion_completa_tratamiento(p_tratamiento_id UUID)
RETURNS TABLE (
    tiene_horarios BOOLEAN,
    cantidad_horarios INTEGER,
    tiene_fechas_disponibles BOOLEAN,
    es_compartido BOOLEAN,
    max_clientes INTEGER,
    boxes_disponibles INTEGER[],
    hora_inicio TIME,
    hora_fin TIME,
    dias_disponibles JSONB
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
        t.max_clientes_por_turno,
        t.boxes_disponibles,
        t.hora_inicio,
        t.hora_fin,
        t.dias_disponibles
    FROM tratamientos t
    WHERE t.id = p_tratamiento_id;
END;
$$ LANGUAGE plpgsql;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION verificar_configuracion_completa_tratamiento TO anon, authenticated;

-- Comentario
COMMENT ON FUNCTION verificar_configuracion_completa_tratamiento IS 'Verifica la configuración completa de un tratamiento, incluyendo horarios, fechas disponibles y boxes'; 