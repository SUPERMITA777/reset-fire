-- Crear la tabla rf_disponibilidad
CREATE TABLE IF NOT EXISTS rf_disponibilidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tratamiento_id UUID NOT NULL REFERENCES rf_tratamientos(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fecha_fin_mayor_inicio CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT hora_fin_mayor_inicio CHECK (hora_fin > hora_inicio),
    CONSTRAINT no_solapamiento_fechas UNIQUE (tratamiento_id, fecha_inicio, fecha_fin)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_rf_disponibilidad_tratamiento ON rf_disponibilidad(tratamiento_id);
CREATE INDEX IF NOT EXISTS idx_rf_disponibilidad_fechas ON rf_disponibilidad(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_rf_disponibilidad_horas ON rf_disponibilidad(hora_inicio, hora_fin);

-- Habilitar RLS
ALTER TABLE rf_disponibilidad ENABLE ROW LEVEL SECURITY;

-- Crear política que permite todas las operaciones
CREATE POLICY "rf_disponibilidad_policy"
ON rf_disponibilidad
FOR ALL
USING (true)
WITH CHECK (true);

-- Crear función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_rf_disponibilidad_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_rf_disponibilidad_updated_at
    BEFORE UPDATE ON rf_disponibilidad
    FOR EACH ROW
    EXECUTE FUNCTION update_rf_disponibilidad_updated_at();

-- Comentarios explicativos
COMMENT ON TABLE rf_disponibilidad IS 'Tabla para gestionar la disponibilidad de horarios de los tratamientos';
COMMENT ON COLUMN rf_disponibilidad.tratamiento_id IS 'ID del tratamiento al que pertenece esta disponibilidad';
COMMENT ON COLUMN rf_disponibilidad.fecha_inicio IS 'Fecha de inicio de la disponibilidad';
COMMENT ON COLUMN rf_disponibilidad.fecha_fin IS 'Fecha final de la disponibilidad';
COMMENT ON COLUMN rf_disponibilidad.hora_inicio IS 'Hora de inicio del horario disponible';
COMMENT ON COLUMN rf_disponibilidad.hora_fin IS 'Hora final del horario disponible';

-- Crear función para verificar disponibilidad
CREATE OR REPLACE FUNCTION verificar_disponibilidad_tratamiento(
    p_tratamiento_id UUID,
    p_fecha DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    tiene_disponibilidad BOOLEAN,
    hora_inicio TIME,
    hora_fin TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(
            SELECT 1 
            FROM rf_disponibilidad 
            WHERE tratamiento_id = p_tratamiento_id 
            AND p_fecha BETWEEN fecha_inicio AND fecha_fin
        ) as tiene_disponibilidad,
        d.hora_inicio,
        d.hora_fin
    FROM rf_disponibilidad d
    WHERE d.tratamiento_id = p_tratamiento_id 
    AND p_fecha BETWEEN d.fecha_inicio AND d.fecha_fin
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 