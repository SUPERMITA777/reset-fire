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

-- Crear políticas RLS para transacciones
ALTER TABLE rf_transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transacciones visibles para todos" ON rf_transacciones
  FOR SELECT USING (true);

CREATE POLICY "Transacciones insertables por todos" ON rf_transacciones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Transacciones actualizables por admin" ON rf_transacciones
  FOR UPDATE USING (auth.role() = 'authenticated'); 