-- Verificar y corregir el box del subtratamiento específico
DO $$
DECLARE
    v_sub_tratamiento_id UUID := 'e39be1ba-ba0a-411b-b9f1-f46ad9b1b8f7';
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
    v_box INTEGER;
    v_boxes_disponibles INTEGER[];
BEGIN
    -- Obtener los boxes disponibles del tratamiento
    SELECT boxes_disponibles INTO v_boxes_disponibles
    FROM tratamientos
    WHERE id = v_tratamiento_id;

    -- Si no hay boxes disponibles, usar el box 1 por defecto
    IF v_boxes_disponibles IS NULL OR array_length(v_boxes_disponibles, 1) = 0 THEN
        v_boxes_disponibles := '{1}'::INTEGER[];
    END IF;

    -- Obtener el box actual del subtratamiento
    SELECT box INTO v_box
    FROM sub_tratamientos
    WHERE id = v_sub_tratamiento_id;

    -- Si el box no está asignado o no está en los boxes disponibles, asignar el primer box disponible
    IF v_box IS NULL OR NOT (v_box = ANY(v_boxes_disponibles)) THEN
        UPDATE sub_tratamientos
        SET box = v_boxes_disponibles[1]
        WHERE id = v_sub_tratamiento_id;

        RAISE NOTICE 'Box asignado al subtratamiento %: %', v_sub_tratamiento_id, v_boxes_disponibles[1];
    ELSE
        RAISE NOTICE 'El subtratamiento % ya tiene asignado el box %', v_sub_tratamiento_id, v_box;
    END IF;
END $$; 