-- Verificar y corregir la configuración del tratamiento específico
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_tiene_fechas BOOLEAN;
    v_tiene_horarios BOOLEAN;
BEGIN
    -- Verificar si el tratamiento existe
    IF NOT EXISTS (SELECT 1 FROM tratamientos WHERE id = v_tratamiento_id) THEN
        RAISE EXCEPTION 'El tratamiento no existe';
    END IF;

    -- Verificar si tiene fechas disponibles
    SELECT EXISTS(
        SELECT 1 
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id 
        AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
    ) INTO v_tiene_fechas;

    -- Verificar si tiene horarios
    SELECT EXISTS(
        SELECT 1 
        FROM horarios_tratamientos 
        WHERE tratamiento_id = v_tratamiento_id
    ) INTO v_tiene_horarios;

    -- Si no tiene horarios, insertarlos
    IF NOT v_tiene_horarios THEN
        INSERT INTO horarios_tratamientos (tratamiento_id, hora_inicio, hora_fin)
        SELECT 
            v_tratamiento_id,
            h.hora_inicio::time,
            h.hora_fin::time
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
        ) AS h(hora_inicio, hora_fin)
        ON CONFLICT (tratamiento_id, hora_inicio) DO NOTHING;
    END IF;

    -- Si no tiene fechas disponibles, insertarlas
    IF NOT v_tiene_fechas THEN
        -- Primero eliminar cualquier fecha existente que pueda estar causando conflictos
        DELETE FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id;

        -- Luego insertar la nueva fecha
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
            v_tratamiento_id,
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
        WHERE t.id = v_tratamiento_id;
    END IF;

    -- Verificar que todo se configuró correctamente
    SELECT EXISTS(
        SELECT 1 
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id 
        AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
    ) INTO v_tiene_fechas;

    IF NOT v_tiene_fechas THEN
        RAISE EXCEPTION 'No se pudieron configurar las fechas disponibles para el tratamiento';
    END IF;
END $$; 