-- Verificar y corregir las fechas disponibles para el tratamiento específico
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_tiene_fechas BOOLEAN;
    v_boxes_disponibles INTEGER[];
    v_hora_inicio TIME;
    v_hora_fin TIME;
    v_max_clientes INTEGER;
    v_es_compartido BOOLEAN;
    r RECORD;  -- Declarar la variable de tipo RECORD para el bucle
BEGIN
    -- Obtener la configuración completa del tratamiento
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

    -- Eliminar todas las fechas existentes para evitar conflictos
    DELETE FROM fechas_disponibles 
    WHERE tratamiento_id = v_tratamiento_id;

    -- Insertar fechas disponibles para los próximos 6 meses
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
        CURRENT_DATE,
        CURRENT_DATE + interval '180 days',  -- 6 meses
        COALESCE(v_boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]),
        COALESCE(v_hora_inicio, '08:00'::time),
        COALESCE(v_hora_fin, '20:00'::time),
        CASE 
            WHEN v_es_compartido THEN COALESCE(v_max_clientes, 2)
            ELSE 1
        END
    );

    -- Verificar que se insertaron las fechas
    SELECT EXISTS(
        SELECT 1 
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id 
        AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
        AND 1 = ANY(boxes_disponibles)  -- Verificar específicamente el box 1
    ) INTO v_tiene_fechas;

    IF NOT v_tiene_fechas THEN
        RAISE EXCEPTION 'No se pudieron configurar las fechas disponibles para el tratamiento';
    END IF;

    -- Mostrar las fechas configuradas
    RAISE NOTICE 'Fechas disponibles configuradas para el tratamiento %:', v_tratamiento_id;
    
    -- Usar un cursor para iterar sobre los resultados
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
ORDER BY fd.fecha_inicio; 