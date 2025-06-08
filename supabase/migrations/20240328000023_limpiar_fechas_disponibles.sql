-- Limpiar las fechas disponibles del tratamiento específico
DO $$
DECLARE
    v_tratamiento_id UUID := 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
BEGIN
    -- Eliminar todas las fechas existentes para el tratamiento
    DELETE FROM fechas_disponibles 
    WHERE tratamiento_id = v_tratamiento_id;

    -- Verificar que se hayan eliminado
    IF EXISTS (
        SELECT 1 
        FROM fechas_disponibles 
        WHERE tratamiento_id = v_tratamiento_id
    ) THEN
        RAISE EXCEPTION 'No se pudieron eliminar todas las fechas disponibles';
    END IF;

    RAISE NOTICE 'Fechas disponibles eliminadas exitosamente para el tratamiento %', v_tratamiento_id;
END $$;

-- Verificar que no queden fechas
SELECT 
    t.id as tratamiento_id,
    t.nombre as tratamiento_nombre,
    fd.fecha_inicio,
    fd.fecha_fin
FROM tratamientos t
LEFT JOIN fechas_disponibles fd ON fd.tratamiento_id = t.id
WHERE t.id = 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c'; 