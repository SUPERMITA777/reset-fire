-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS rf_productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  categoria VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS rf_transacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES rf_clientes(id),
  carrito_id UUID REFERENCES rf_carrito_compras(id),
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  impuestos DECIMAL(10,2) DEFAULT 0,
  metodo_pago VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  notas TEXT,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos productos de ejemplo
INSERT INTO rf_productos (nombre, descripcion, precio, stock, categoria) VALUES
('Crema Hidratante', 'Crema hidratante facial de alta calidad', 25.00, 50, 'Cosmética'),
('Protector Solar', 'Protector solar SPF 50+', 35.00, 30, 'Protección'),
('Mascarilla Facial', 'Mascarilla nutritiva para todo tipo de piel', 15.00, 40, 'Tratamiento'),
('Serum Vitamina C', 'Serum antioxidante con vitamina C', 45.00, 25, 'Serum'),
('Limpiador Facial', 'Gel limpiador suave para uso diario', 20.00, 35, 'Limpieza');

-- Crear políticas RLS para productos
ALTER TABLE rf_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos visibles para todos" ON rf_productos
  FOR SELECT USING (activo = true);

CREATE POLICY "Productos gestionables por admin" ON rf_productos
  FOR ALL USING (auth.role() = 'authenticated');

-- Crear políticas RLS para transacciones
ALTER TABLE rf_transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transacciones visibles para todos" ON rf_transacciones
  FOR SELECT USING (true);

CREATE POLICY "Transacciones insertables por todos" ON rf_transacciones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Transacciones actualizables por admin" ON rf_transacciones
  FOR UPDATE USING (auth.role() = 'authenticated'); 