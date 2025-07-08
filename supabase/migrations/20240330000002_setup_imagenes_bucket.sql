-- Crear bucket para imágenes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete imagenes" ON storage.objects;
DROP POLICY IF EXISTS "imagenes_public_read" ON storage.objects;
DROP POLICY IF EXISTS "imagenes_auth_write" ON storage.objects;

-- Crear política para lectura pública (permite a cualquiera ver las imágenes)
CREATE POLICY "imagenes_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'imagenes');

-- Crear política para escritura de usuarios autenticados (permite subir imágenes)
CREATE POLICY "imagenes_auth_write" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'imagenes');

-- Crear política para actualización de usuarios autenticados
CREATE POLICY "imagenes_auth_update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'imagenes');

-- Crear política para eliminación de usuarios autenticados
CREATE POLICY "imagenes_auth_delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'imagenes');

-- Comentarios explicativos
COMMENT ON POLICY "imagenes_public_read" ON storage.objects IS 'Permite lectura pública de todas las imágenes en el bucket imagenes';
COMMENT ON POLICY "imagenes_auth_write" ON storage.objects IS 'Permite a usuarios autenticados subir imágenes al bucket imagenes';
COMMENT ON POLICY "imagenes_auth_update" ON storage.objects IS 'Permite a usuarios autenticados actualizar imágenes en el bucket imagenes';
COMMENT ON POLICY "imagenes_auth_delete" ON storage.objects IS 'Permite a usuarios autenticados eliminar imágenes del bucket imagenes'; 