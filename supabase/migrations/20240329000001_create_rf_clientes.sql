-- Crear la tabla rf_clientes
CREATE TABLE IF NOT EXISTS rf_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(20),
    fecha_nacimiento DATE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla para las imágenes de los clientes
CREATE TABLE IF NOT EXISTS rf_clientes_imagenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES rf_clientes(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(50) NOT NULL,
    tamanio_bytes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_tamanio_archivo CHECK (tamanio_bytes > 0 AND tamanio_bytes <= 10485760) -- máximo 10MB
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_rf_clientes_dni ON rf_clientes(dni);
CREATE INDEX IF NOT EXISTS idx_rf_clientes_nombre_apellido ON rf_clientes(nombre, apellido);
CREATE INDEX IF NOT EXISTS idx_rf_clientes_whatsapp ON rf_clientes(whatsapp);
CREATE INDEX IF NOT EXISTS idx_rf_clientes_imagenes_cliente ON rf_clientes_imagenes(cliente_id);

-- Habilitar RLS
ALTER TABLE rf_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rf_clientes_imagenes ENABLE ROW LEVEL SECURITY;

-- Crear políticas que permiten todas las operaciones
CREATE POLICY "rf_clientes_policy"
ON rf_clientes
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "rf_clientes_imagenes_policy"
ON rf_clientes_imagenes
FOR ALL
USING (true)
WITH CHECK (true);

-- Comentarios explicativos
COMMENT ON TABLE rf_clientes IS 'Tabla para gestionar los clientes de Reset Fire';
COMMENT ON COLUMN rf_clientes.dni IS 'Documento Nacional de Identidad del cliente';
COMMENT ON COLUMN rf_clientes.nombre IS 'Nombre del cliente';
COMMENT ON COLUMN rf_clientes.apellido IS 'Apellido del cliente';
COMMENT ON COLUMN rf_clientes.whatsapp IS 'Número de WhatsApp del cliente';
COMMENT ON COLUMN rf_clientes.fecha_nacimiento IS 'Fecha de nacimiento del cliente';
COMMENT ON COLUMN rf_clientes.observaciones IS 'Observaciones o notas adicionales sobre el cliente';

COMMENT ON TABLE rf_clientes_imagenes IS 'Tabla para almacenar las imágenes de los clientes';
COMMENT ON COLUMN rf_clientes_imagenes.url IS 'URL de la imagen almacenada en el bucket de Supabase';
COMMENT ON COLUMN rf_clientes_imagenes.nombre_archivo IS 'Nombre original del archivo';
COMMENT ON COLUMN rf_clientes_imagenes.tipo_archivo IS 'Tipo MIME del archivo';
COMMENT ON COLUMN rf_clientes_imagenes.tamanio_bytes IS 'Tamaño del archivo en bytes';

-- Crear bucket para almacenar las imágenes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('rf_clientes_imagenes', 'rf_clientes_imagenes', false)
ON CONFLICT (id) DO NOTHING;

-- Crear política para el bucket de imágenes
CREATE POLICY "rf_clientes_imagenes_bucket_policy"
ON storage.objects
FOR ALL
USING (bucket_id = 'rf_clientes_imagenes')
WITH CHECK (bucket_id = 'rf_clientes_imagenes'); 