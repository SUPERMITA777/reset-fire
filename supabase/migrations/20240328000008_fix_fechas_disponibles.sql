-- Verificar y corregir fechas disponibles para el tratamiento específico
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_tiene_fechas BOOLEAN;
    v_boxes_disponibles INTEGER[];
    v_hora_inicio TIME;
    v_hora_fin TIME;
BEGIN
    -- Obtener la configuración del tratamiento
    SELECT 
        boxes_disponibles,
        hora_inicio,
        hora_fin
    INTO 
        v_boxes_disponibles,
        v_hora_inicio,
        v_hora_fin
    FROM tratamientos
    WHERE id = v_tratamiento_id;

    -- Verificar si el tratamiento tiene fechas disponibles
    SELECT EXISTS(
        SELECT 1 
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id
        AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
    ) INTO v_tiene_fechas;

    -- Si no tiene fechas disponibles o las fechas no son válidas, eliminarlas y crear nuevas
    IF NOT v_tiene_fechas THEN
        -- Eliminar fechas existentes que puedan estar causando conflictos
        DELETE FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id;

        -- Insertar nuevas fechas disponibles
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
            CURRENT_DATE + interval '30 days',
            COALESCE(v_boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]),
            COALESCE(v_hora_inicio, '08:00'::time),
            COALESCE(v_hora_fin, '20:00'::time),
            1
        );

        -- Verificar que se insertaron las fechas
        SELECT EXISTS(
            SELECT 1 
            FROM fechas_disponibles 
            WHERE tratamiento_id = v_tratamiento_id
            AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
        ) INTO v_tiene_fechas;

        IF NOT v_tiene_fechas THEN
            RAISE EXCEPTION 'No se pudieron configurar las fechas disponibles para el tratamiento';
        END IF;
    END IF;

    -- Mostrar las fechas configuradas
    RAISE NOTICE 'Fechas disponibles configuradas para el tratamiento %:', v_tratamiento_id;
    FOR v_fecha_inicio, v_fecha_fin, v_boxes IN 
        SELECT 
            fecha_inicio, 
            fecha_fin, 
            boxes_disponibles
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id 
        AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
    LOOP
        RAISE NOTICE 'Rango: % a %, Boxes: %', v_fecha_inicio, v_fecha_fin, v_boxes;
    END LOOP;
END $$; 