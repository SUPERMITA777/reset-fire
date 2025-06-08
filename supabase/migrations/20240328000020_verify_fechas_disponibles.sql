-- Verificar las fechas disponibles para el tratamiento específico
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_box_id INTEGER := 1;
    v_fecha_actual DATE := CURRENT_DATE;
    v_fecha_seleccionada DATE := '2025-06-07'::DATE;
BEGIN
    -- Mostrar información de fechas disponibles
    RAISE NOTICE 'Verificando fechas disponibles para el tratamiento %:', v_tratamiento_id;
    RAISE NOTICE '----------------------------------------';
    
    -- Mostrar todas las fechas disponibles
    RAISE NOTICE 'Fechas disponibles en la tabla:';
    FOR r IN 
        SELECT 
            fecha_inicio,
            fecha_fin,
            boxes_disponibles,
            hora_inicio,
            hora_fin
        FROM fechas_disponibles
        WHERE tratamiento_id = v_tratamiento_id
        ORDER BY fecha_inicio
    LOOP
        RAISE NOTICE 'Período: % a %, Boxes: %, Horario: % a %',
            r.fecha_inicio, r.fecha_fin, r.boxes_disponibles, r.hora_inicio, r.hora_fin;
    END LOOP;

    -- Verificar específicamente la fecha seleccionada
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Verificando fecha seleccionada (%):', v_fecha_seleccionada;
    
    IF EXISTS (
        SELECT 1 
        FROM fechas_disponibles fd
        WHERE fd.tratamiento_id = v_tratamiento_id 
        AND v_fecha_seleccionada BETWEEN fd.fecha_inicio AND fd.fecha_fin
        AND v_box_id = ANY(fd.boxes_disponibles)
    ) THEN
        RAISE NOTICE 'La fecha está disponible para el box %', v_box_id;
    ELSE
        RAISE NOTICE 'La fecha NO está disponible para el box %', v_box_id;
    END IF;

    -- Verificar la fecha actual
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Verificando fecha actual (%):', v_fecha_actual;
    
    IF EXISTS (
        SELECT 1 
        FROM fechas_disponibles fd
        WHERE fd.tratamiento_id = v_tratamiento_id 
        AND v_fecha_actual BETWEEN fd.fecha_inicio AND fd.fecha_fin
        AND v_box_id = ANY(fd.boxes_disponibles)
    ) THEN
        RAISE NOTICE 'La fecha actual está disponible para el box %', v_box_id;
    ELSE
        RAISE NOTICE 'La fecha actual NO está disponible para el box %', v_box_id;
    END IF;

    -- Insertar fechas si no existen
    IF NOT EXISTS (
        SELECT 1 
        FROM fechas_disponibles fd
        WHERE fd.tratamiento_id = v_tratamiento_id 
        AND v_fecha_seleccionada BETWEEN fd.fecha_inicio AND fd.fecha_fin
        AND v_box_id = ANY(fd.boxes_disponibles)
    ) THEN
        RAISE NOTICE '----------------------------------------';
        RAISE NOTICE 'Insertando nuevas fechas disponibles...';
        
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
            v_fecha_seleccionada,
            v_fecha_seleccionada + interval '30 days',
            t.boxes_disponibles,
            t.hora_inicio,
            t.hora_fin,
            8
        FROM tratamientos t
        WHERE t.id = v_tratamiento_id
        ON CONFLICT (tratamiento_id, fecha_inicio) DO UPDATE
        SET 
            fecha_fin = EXCLUDED.fecha_fin,
            boxes_disponibles = EXCLUDED.boxes_disponibles,
            hora_inicio = EXCLUDED.hora_inicio,
            hora_fin = EXCLUDED.hora_fin,
            cantidad_clientes = EXCLUDED.cantidad_clientes;

        RAISE NOTICE 'Nuevas fechas insertadas/actualizadas';
    END IF;
END $$;

-- Mostrar el resultado final
SELECT 
    t.id as tratamiento_id,
    t.nombre as tratamiento_nombre,
    fd.fecha_inicio,
    fd.fecha_fin,
    fd.boxes_disponibles,
    fd.hora_inicio,
    fd.hora_fin,
    fd.cantidad_clientes
FROM tratamientos t
LEFT JOIN fechas_disponibles fd ON fd.tratamiento_id = t.id
WHERE t.id = 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c'
AND (
    CURRENT_DATE BETWEEN fd.fecha_inicio AND fd.fecha_fin
    OR '2025-06-07'::DATE BETWEEN fd.fecha_inicio AND fd.fecha_fin
)
ORDER BY fd.fecha_inicio; 