-- Insertar datos de prueba en rf_disponibilidad para todos los tratamientos
DO $$
DECLARE
    v_tratamiento RECORD;
BEGIN
    -- Para cada tratamiento, crear disponibilidad para los próximos 30 días
    FOR v_tratamiento IN 
        SELECT id, nombre_tratamiento 
        FROM rf_tratamientos
    LOOP
        -- Insertar disponibilidad solo si no existe
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
            v_tratamiento.id,
            CURRENT_DATE,
            CURRENT_DATE + interval '30 days',
            '08:00'::time,
            '20:00'::time,
            ARRAY[1,2,3,4,5,6,7,8],
            1
        WHERE NOT EXISTS (
            SELECT 1 
            FROM rf_disponibilidad d
            WHERE d.tratamiento_id = v_tratamiento.id
            AND CURRENT_DATE BETWEEN d.fecha_inicio AND d.fecha_fin
        );

        RAISE NOTICE 'Disponibilidad creada para tratamiento: %', v_tratamiento.nombre_tratamiento;
    END LOOP;
END $$; 