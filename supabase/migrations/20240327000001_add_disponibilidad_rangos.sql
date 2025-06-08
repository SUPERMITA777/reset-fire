-- Crear tabla para rangos de disponibilidad
CREATE TABLE IF NOT EXISTS rangos_disponibilidad (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tratamiento_id UUID REFERENCES tratamientos(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    boxes_disponibles INTEGER[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fecha_fin_mayor_inicio CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT hora_fin_mayor_inicio CHECK (hora_fin > hora_inicio)
);

-- Crear índice para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_rangos_disponibilidad_tratamiento_fechas 
ON rangos_disponibilidad(tratamiento_id, fecha_inicio, fecha_fin);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE TRIGGER actualizar_rangos_disponibilidad_updated_at
    BEFORE UPDATE ON rangos_disponibilidad
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- Crear función para verificar disponibilidad en un rango
CREATE OR REPLACE FUNCTION verificar_disponibilidad_rango(
    p_tratamiento_id UUID,
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_hora_inicio TIME,
    p_hora_fin TIME
)
RETURNS BOOLEAN AS $$
DECLARE
    v_solapamiento BOOLEAN;
BEGIN
    -- Verificar si existe algún rango que se solape con el nuevo rango
    SELECT EXISTS (
        SELECT 1
        FROM rangos_disponibilidad
        WHERE tratamiento_id = p_tratamiento_id
        AND (
            -- Caso 1: El nuevo rango está completamente dentro de un rango existente
            (fecha_inicio <= p_fecha_inicio AND fecha_fin >= p_fecha_fin)
            OR
            -- Caso 2: El nuevo rango contiene completamente un rango existente
            (fecha_inicio >= p_fecha_inicio AND fecha_fin <= p_fecha_fin)
            OR
            -- Caso 3: El nuevo rango se solapa con el inicio de un rango existente
            (fecha_inicio < p_fecha_fin AND fecha_fin >= p_fecha_fin)
            OR
            -- Caso 4: El nuevo rango se solapa con el fin de un rango existente
            (fecha_inicio <= p_fecha_inicio AND fecha_fin > p_fecha_inicio)
        )
        AND (
            -- Verificar solapamiento de horarios
            (hora_inicio <= p_hora_inicio AND hora_fin > p_hora_inicio)
            OR
            (hora_inicio < p_hora_fin AND hora_fin >= p_hora_fin)
            OR
            (hora_inicio >= p_hora_inicio AND hora_fin <= p_hora_fin)
        )
    ) INTO v_solapamiento;

    RETURN NOT v_solapamiento;
END;
$$ LANGUAGE plpgsql;

-- Crear función para obtener rangos de disponibilidad
CREATE OR REPLACE FUNCTION obtener_rangos_disponibilidad(
    p_tratamiento_id UUID,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    fecha_inicio DATE,
    fecha_fin DATE,
    hora_inicio TIME,
    hora_fin TIME,
    boxes_disponibles INTEGER[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rd.id,
        rd.fecha_inicio,
        rd.fecha_fin,
        rd.hora_inicio,
        rd.hora_fin,
        rd.boxes_disponibles
    FROM rangos_disponibilidad rd
    WHERE rd.tratamiento_id = p_tratamiento_id
    AND (
        (p_fecha_inicio IS NULL AND p_fecha_fin IS NULL)
        OR
        (rd.fecha_inicio <= p_fecha_fin AND rd.fecha_fin >= p_fecha_inicio)
    )
    ORDER BY rd.fecha_inicio, rd.hora_inicio;
END;
$$ LANGUAGE plpgsql; 