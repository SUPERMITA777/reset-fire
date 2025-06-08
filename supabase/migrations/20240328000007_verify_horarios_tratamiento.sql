-- Verificar y asegurar horarios para el tratamiento específico
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_tiene_horarios BOOLEAN;
    v_hora_inicio TIME;
    v_hora_fin TIME;
BEGIN
    -- Verificar si el tratamiento tiene horarios
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
            hora_inicio,
            hora_fin
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
        ) AS horas(hora_inicio, hora_fin);

        -- Verificar que se insertaron los horarios
        SELECT EXISTS(
            SELECT 1 
            FROM horarios_tratamientos 
            WHERE tratamiento_id = v_tratamiento_id
        ) INTO v_tiene_horarios;

        IF NOT v_tiene_horarios THEN
            RAISE EXCEPTION 'No se pudieron configurar los horarios para el tratamiento';
        END IF;
    END IF;

    -- Mostrar los horarios configurados
    RAISE NOTICE 'Horarios configurados para el tratamiento %:', v_tratamiento_id;
    FOR v_hora_inicio, v_hora_fin IN 
        SELECT hora_inicio, hora_fin 
        FROM horarios_tratamientos 
        WHERE tratamiento_id = v_tratamiento_id 
        ORDER BY hora_inicio
    LOOP
        RAISE NOTICE 'Horario: % - %', v_hora_inicio, v_hora_fin;
    END LOOP;
END $$; 