-- Script para configurar el bucket de imágenes en Supabase
-- Ejecutar en el SQL Editor de la consola de Supabase

-- 1. Crear bucket para imágenes si no existe (ejecutar en Storage > Buckets o SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete imagenes" ON storage.objects;
DROP POLICY IF EXISTS "imagenes_public_read" ON storage.objects;
DROP POLICY IF EXISTS "imagenes_auth_write" ON storage.objects;
DROP POLICY IF EXISTS "imagenes_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "imagenes_auth_delete" ON storage.objects;

-- 3. Crear política para lectura pública (permite a cualquiera ver las imágenes)
CREATE POLICY "imagenes_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'imagenes');

-- 4. Crear política para escritura de usuarios autenticados (permite subir imágenes)
CREATE POLICY "imagenes_auth_write" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'imagenes');

-- 5. Crear política para actualización de usuarios autenticados
CREATE POLICY "imagenes_auth_update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'imagenes');

-- 6. Crear política para eliminación de usuarios autenticados
CREATE POLICY "imagenes_auth_delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'imagenes');

-- 7. Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%imagenes%'
ORDER BY policyname;

-- 8. Verificar que el bucket existe y es público
SELECT id, name, public FROM storage.buckets WHERE name = 'imagenes'; 