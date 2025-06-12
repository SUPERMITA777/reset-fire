-- Eliminar la tabla si existe
DROP TABLE IF EXISTS rf_citas;

-- Crear tabla rf_citas simplificada
CREATE TABLE rf_citas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID REFERENCES rf_clientes(id),
    tratamiento_id UUID REFERENCES rf_tratamientos(id),
    subtratamiento_id UUID REFERENCES rf_subtratamientos(id),
    precio DECIMAL(10,2),
    sena DECIMAL(10,2),
    fecha DATE,
    hora TIME,
    box INTEGER,
    estado VARCHAR(20),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices básicos
CREATE INDEX idx_citas_paciente ON rf_citas(paciente_id);
CREATE INDEX idx_citas_fecha ON rf_citas(fecha);
CREATE INDEX idx_citas_estado ON rf_citas(estado);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_citas_updated_at
    BEFORE UPDATE ON rf_citas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 