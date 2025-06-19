-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS rf_productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    foto_url TEXT,
    costo DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_marca ON rf_productos(marca);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON rf_productos(nombre);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON rf_productos(stock);

-- Habilitar RLS (Row Level Security)
ALTER TABLE rf_productos ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Permitir acceso completo a productos" ON rf_productos
    FOR ALL USING (true);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON rf_productos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos productos de ejemplo
INSERT INTO rf_productos (marca, nombre, descripcion, costo, precio_venta, stock) VALUES
('L''Oreal', 'Shampoo Profesional', 'Shampoo para cabello seco y dañado', 15.50, 25.00, 50),
('Wella', 'Mascarilla Nutritiva', 'Mascarilla reparadora intensiva', 22.00, 35.00, 30),
('Matrix', 'Acondicionador Suave', 'Acondicionador para todo tipo de cabello', 12.00, 20.00, 45),
('Redken', 'Tratamiento Keratina', 'Tratamiento reparador con queratina', 45.00, 75.00, 20),
('Schwarzkopf', 'Tinte Profesional', 'Tinte permanente para cabello', 18.00, 30.00, 60); 