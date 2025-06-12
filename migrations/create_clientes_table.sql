-- Crear tabla temporal con la nueva estructura
CREATE TABLE rf_clientes_temp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Copiar datos de la tabla antigua a la nueva
INSERT INTO rf_clientes_temp (id, dni, nombre_completo, whatsapp, created_at, updated_at)
SELECT 
    id,
    dni,
    CONCAT(nombre, ' ', apellido) as nombre_completo,
    whatsapp,
    created_at,
    updated_at
FROM rf_clientes;

-- Eliminar la tabla antigua con CASCADE para manejar las dependencias
DROP TABLE rf_clientes CASCADE;

-- Renombrar la tabla temporal
ALTER TABLE rf_clientes_temp RENAME TO rf_clientes;

-- Crear índices para búsquedas eficientes
CREATE INDEX idx_clientes_dni ON rf_clientes(dni);
CREATE INDEX idx_clientes_nombre ON rf_clientes(nombre_completo);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON rf_clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Actualizar la tabla de citas para incluir los nuevos estados
ALTER TABLE rf_citas 
DROP CONSTRAINT IF EXISTS rf_citas_estado_check;

ALTER TABLE rf_citas 
ADD CONSTRAINT rf_citas_estado_check 
CHECK (estado IN ('reservado', 'confirmado', 'asis', 'completado', 'cancelado')); 