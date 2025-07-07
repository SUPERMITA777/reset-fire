-- Agregar campo observaciones a la tabla rf_clientes
ALTER TABLE rf_clientes 
ADD COLUMN observaciones TEXT;

-- Agregar comentario al campo
COMMENT ON COLUMN rf_clientes.observaciones IS 'Observaciones del cliente como alergias, medicación, etc.'; 