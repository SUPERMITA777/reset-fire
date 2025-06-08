-- Configurar fechas disponibles para junio de 2025
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_box_id INTEGER := 1;
    v_fecha_seleccionada DATE := '2025-06-07'::DATE;
    v_boxes_disponibles INTEGER[];
    v_hora_inicio TIME;
    v_hora_fin TIME;
    v_max_clientes INTEGER;
    v_es_compartido BOOLEAN;
    r RECORD;  -- Declarar la variable de tipo RECORD para el bucle
BEGIN
    -- Obtener la configuración del tratamiento
    SELECT 
        boxes_disponibles,
        hora_inicio,
        hora_fin,
        max_clientes_por_turno,
        es_compartido
    INTO 
        v_boxes_disponibles,
        v_hora_inicio,
        v_hora_fin,
        v_max_clientes,
        v_es_compartido
    FROM tratamientos
    WHERE id = v_tratamiento_id;

    -- Verificar si el tratamiento existe
    IF v_boxes_disponibles IS NULL THEN
        RAISE EXCEPTION 'El tratamiento no existe';
    END IF;

    -- Eliminar fechas existentes que puedan estar causando conflictos
    DELETE FROM fechas_disponibles 
    WHERE tratamiento_id = v_tratamiento_id
    AND (
        fecha_inicio > v_fecha_seleccionada + interval '30 days'
        OR fecha_fin < v_fecha_seleccionada
        OR NOT (v_box_id = ANY(boxes_disponibles))
    );

    -- Insertar nuevas fechas disponibles para junio 2025
    INSERT INTO fechas_disponibles (
        tratamiento_id,
        fecha_inicio,
        fecha_fin,
        boxes_disponibles,
        hora_inicio,
        hora_fin,
        cantidad_clientes
    )
    VALUES (
        v_tratamiento_id,
        v_fecha_seleccionada,
        v_fecha_seleccionada + interval '30 days',
        COALESCE(v_boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]),
        COALESCE(v_hora_inicio, '08:00'::time),
        COALESCE(v_hora_fin, '20:00'::time),
        CASE 
            WHEN v_es_compartido THEN COALESCE(v_max_clientes, 8)
            ELSE 1
        END
    );

    -- Verificar que se insertaron las fechas
    IF NOT EXISTS (
        SELECT 1 
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id 
        AND v_fecha_seleccionada BETWEEN fecha_inicio AND fecha_fin
        AND v_box_id = ANY(boxes_disponibles)
    ) THEN
        RAISE EXCEPTION 'No se pudieron configurar las fechas disponibles para el tratamiento';
    END IF;

    -- Mostrar las fechas configuradas
    RAISE NOTICE 'Fechas disponibles configuradas para el tratamiento %:', v_tratamiento_id;
    FOR r IN 
        SELECT 
            fecha_inicio,
            fecha_fin,
            boxes_disponibles,
            hora_inicio,
            hora_fin,
            cantidad_clientes
        FROM fechas_disponibles
        WHERE tratamiento_id = v_tratamiento_id
        ORDER BY fecha_inicio
    LOOP
        RAISE NOTICE 'Período: % a %, Boxes: %, Horario: % a %, Cupos: %',
            r.fecha_inicio, r.fecha_fin, r.boxes_disponibles, r.hora_inicio, r.hora_fin, r.cantidad_clientes;
    END LOOP;
END $$;

-- Verificar que las fechas se hayan configurado correctamente
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
AND '2025-06-07'::DATE BETWEEN fd.fecha_inicio AND fd.fecha_fin
ORDER BY fd.fecha_inicio; 