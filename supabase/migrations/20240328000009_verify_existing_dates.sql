-- Verificar fechas y horarios existentes del tratamiento
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_nombre TEXT;
    v_es_compartido BOOLEAN;
    v_max_clientes INTEGER;
    v_boxes_disponibles INTEGER[];
    v_hora_inicio TIME;
    v_hora_fin TIME;
    v_fecha_inicio DATE;
    v_fecha_fin DATE;
    v_cantidad_clientes INTEGER;
BEGIN
    -- Mostrar información del tratamiento
    RAISE NOTICE 'Información del tratamiento %:', v_tratamiento_id;
    RAISE NOTICE '----------------------------------------';
    
    -- Mostrar configuración del tratamiento
    RAISE NOTICE 'Configuración del tratamiento:';
    SELECT 
        nombre,
        es_compartido,
        max_clientes_por_turno,
        boxes_disponibles,
        hora_inicio,
        hora_fin
    INTO 
        v_nombre,
        v_es_compartido,
        v_max_clientes,
        v_boxes_disponibles,
        v_hora_inicio,
        v_hora_fin
    FROM tratamientos 
    WHERE id = v_tratamiento_id;

    RAISE NOTICE 'Nombre: %', v_nombre;
    RAISE NOTICE 'Es compartido: %', v_es_compartido;
    RAISE NOTICE 'Max clientes por turno: %', v_max_clientes;
    RAISE NOTICE 'Boxes disponibles: %', v_boxes_disponibles;
    RAISE NOTICE 'Horario configurado: % a %', v_hora_inicio, v_hora_fin;

    -- Mostrar fechas disponibles
    RAISE NOTICE '';
    RAISE NOTICE 'Fechas disponibles configuradas:';
    RAISE NOTICE '----------------------------------------';
    FOR v_fecha_inicio, v_fecha_fin, v_hora_inicio, v_hora_fin, v_boxes_disponibles, v_cantidad_clientes IN 
        SELECT 
            fecha_inicio,
            fecha_fin,
            hora_inicio,
            hora_fin,
            boxes_disponibles,
            cantidad_clientes
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id
        ORDER BY fecha_inicio
    LOOP
        RAISE NOTICE 'Rango de fechas: % a %', v_fecha_inicio, v_fecha_fin;
        RAISE NOTICE 'Horario: % a %', v_hora_inicio, v_hora_fin;
        RAISE NOTICE 'Boxes: %', v_boxes_disponibles;
        RAISE NOTICE 'Cantidad de clientes: %', v_cantidad_clientes;
        RAISE NOTICE '----------------------------------------';
    END LOOP;

    -- Mostrar horarios configurados
    RAISE NOTICE '';
    RAISE NOTICE 'Horarios configurados:';
    RAISE NOTICE '----------------------------------------';
    FOR v_hora_inicio, v_hora_fin IN 
        SELECT 
            hora_inicio,
            hora_fin
        FROM horarios_tratamientos 
        WHERE tratamiento_id = v_tratamiento_id
        ORDER BY hora_inicio
    LOOP
        RAISE NOTICE 'Horario: % a %', v_hora_inicio, v_hora_fin;
    END LOOP;
END $$; 