-- Agregar campos de foto y descripción a rf_tratamientos
ALTER TABLE rf_tratamientos 
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Agregar campos de foto y descripción a rf_subtratamientos
ALTER TABLE rf_subtratamientos 
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Comentarios para los nuevos campos
COMMENT ON COLUMN rf_tratamientos.foto_url IS 'URL de la imagen del tratamiento';
COMMENT ON COLUMN rf_tratamientos.descripcion IS 'Descripción detallada del tratamiento';
COMMENT ON COLUMN rf_subtratamientos.foto_url IS 'URL de la imagen del subtratamiento';
COMMENT ON COLUMN rf_subtratamientos.descripcion IS 'Descripción detallada del subtratamiento'; 