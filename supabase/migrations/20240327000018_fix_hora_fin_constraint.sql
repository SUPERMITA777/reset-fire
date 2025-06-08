-- Eliminar la restricción existente
ALTER TABLE fechas_disponibles
DROP CONSTRAINT IF EXISTS hora_fin_mayor_inicio;

-- Agregar la nueva restricción que permite hora_fin = hora_inicio para turnos compartidos
ALTER TABLE fechas_disponibles
ADD CONSTRAINT hora_fin_mayor_inicio CHECK (
    (cantidad_clientes > 1 AND hora_fin = hora_inicio) OR
    (cantidad_clientes = 1 AND hora_fin > hora_inicio)
); 