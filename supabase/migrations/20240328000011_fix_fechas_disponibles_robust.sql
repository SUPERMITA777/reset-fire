-- Verificar y corregir fechas disponibles para el tratamiento específico de manera más robusta
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_tiene_fechas BOOLEAN;
    v_boxes_disponibles INTEGER[];
    v_hora_inicio TIME;
    v_hora_fin TIME;
    v_max_clientes INTEGER;
    v_es_compartido BOOLEAN;
    v_fecha_inicio DATE;
    v_fecha_fin DATE;
    v_boxes INTEGER[];
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

    -- Verificar si hay horarios configurados
    IF NOT EXISTS (
        SELECT 1 
        FROM horarios_tratamientos 
        WHERE tratamiento_id = v_tratamiento_id
    ) THEN
        -- Insertar horarios por defecto si no existen
        INSERT INTO horarios_tratamientos (tratamiento_id, hora_inicio, hora_fin)
        VALUES 
            (v_tratamiento_id, '08:00'::time, '09:00'::time),
            (v_tratamiento_id, '09:00'::time, '10:00'::time),
            (v_tratamiento_id, '10:00'::time, '11:00'::time),
            (v_tratamiento_id, '11:00'::time, '12:00'::time),
            (v_tratamiento_id, '12:00'::time, '13:00'::time),
            (v_tratamiento_id, '13:00'::time, '14:00'::time),
            (v_tratamiento_id, '14:00'::time, '15:00'::time),
            (v_tratamiento_id, '15:00'::time, '16:00'::time),
            (v_tratamiento_id, '16:00'::time, '17:00'::time),
            (v_tratamiento_id, '17:00'::time, '18:00'::time),
            (v_tratamiento_id, '18:00'::time, '19:00'::time),
            (v_tratamiento_id, '19:00'::time, '20:00'::time);

        RAISE NOTICE 'Horarios por defecto configurados para el tratamiento';
    END IF;

    -- Verificar si hay fechas disponibles válidas
    SELECT EXISTS(
        SELECT 1 
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id
        AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
        AND array_length(boxes_disponibles, 1) > 0
    ) INTO v_tiene_fechas;

    -- Si no tiene fechas disponibles válidas, eliminarlas y crear nuevas
    IF NOT v_tiene_fechas THEN
        -- Eliminar todas las fechas existentes para este tratamiento
        DELETE FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id;

        -- Configurar fechas por defecto
        v_fecha_inicio := CURRENT_DATE;
        v_fecha_fin := CURRENT_DATE + interval '30 days';

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
            v_fecha_inicio,
            v_fecha_fin,
            COALESCE(v_boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]),
            COALESCE(v_hora_inicio, '08:00'::time),
            COALESCE(v_hora_fin, '20:00'::time),
            COALESCE(v_max_clientes, 1)
        );

        -- Verificar que se insertaron las fechas correctamente
        SELECT EXISTS(
            SELECT 1 
            FROM fechas_disponibles 
            WHERE tratamiento_id = v_tratamiento_id
            AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
            AND array_length(boxes_disponibles, 1) > 0
        ) INTO v_tiene_fechas;

        IF NOT v_tiene_fechas THEN
            RAISE EXCEPTION 'No se pudieron configurar las fechas disponibles para el tratamiento';
        END IF;

        RAISE NOTICE 'Nuevas fechas disponibles configuradas para el tratamiento %:', v_tratamiento_id;
        RAISE NOTICE 'Rango: % a %', v_fecha_inicio, v_fecha_fin;
        RAISE NOTICE 'Boxes disponibles: %', COALESCE(v_boxes_disponibles, '{1,2,3,4,5,6,7,8}'::integer[]);
        RAISE NOTICE 'Horario: % a %', COALESCE(v_hora_inicio, '08:00'::time), COALESCE(v_hora_fin, '20:00'::time);
        RAISE NOTICE 'Cantidad de clientes: %', COALESCE(v_max_clientes, 1);
    ELSE
        -- Mostrar las fechas existentes
        RAISE NOTICE 'Fechas disponibles existentes para el tratamiento %:', v_tratamiento_id;
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
    END IF;
END $$; 