# Solución: Imágenes no se muestran en página institucional

## ✅ Cambios aplicados al código

### 1. **InstitucionalClient.tsx mejorado**
- **Altura fija**: Contenedores de imagen ahora tienen altura explícita (`280px` para tarjetas principales, `48px` para subtratamientos)
- **Componente OptimizedImage**: Reemplazamos `Image` de Next.js con un componente optimizado que maneja errores automáticamente
- **Fallback mejorado**: Lógica robusta para mostrar imagen por defecto cuando `foto_url` es null, undefined o vacío
- **Overlay gradient**: Mejor legibilidad del texto sobre las imágenes
- **Eliminado priority**: Para evitar cargar todas las imágenes como prioritarias

### 2. **Componente OptimizedImage creado**
- Manejo automático de errores de carga
- Fallback a imagen por defecto
- Configuración automática de `sizes` para mejor performance
- Props simplificadas y reutilizable

### 3. **Advertencia de viewport solucionada**
- Archivo `viewport.ts` ya configurado correctamente en `/app/institucional/`

## 🔧 Configuración del bucket de Supabase (PENDIENTE)

### Pasos para configurar el bucket `imagenes`:

#### Opción 1: Usar el script SQL (Recomendado)
1. Ve a tu consola de Supabase → **SQL Editor**
2. Ejecuta el script: `scripts/setup-bucket-imagenes.sql`
3. Verifica que se ejecutó sin errores

#### Opción 2: Configuración manual
1. **Storage → Buckets**:
   - Crear bucket `imagenes` (si no existe)
   - Marcar como **público**
   - Configurar límites: 5MB, tipos permitidos: JPG, PNG, WEBP

2. **Storage → Policies**:
   ```sql
   -- Lectura pública
   CREATE POLICY "imagenes_public_read" ON storage.objects
     FOR SELECT USING (bucket_id = 'imagenes');
   
   -- Escritura autenticada
   CREATE POLICY "imagenes_auth_write" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'imagenes');
   ```

## 🧪 Pruebas para verificar la solución

### 1. **Verificar bucket de Supabase**
```bash
# Copiar una URL de imagen que hayas subido
# Ejemplo: https://tuproyecto.supabase.co/storage/v1/object/public/imagenes/tratamientos/abc123.jpg
# Abrir en navegador incógnito
```

### 2. **Verificar imágenes en la página**
1. Abrir `/institucional` en el navegador
2. Verificar que las tarjetas tengan altura fija
3. Verificar que se muestre imagen por defecto si no hay foto_url
4. Verificar que no aparezcan warnings de Next.js en consola

### 3. **Verificar funcionalidad de expansión**
1. Hacer clic en una tarjeta de tratamiento
2. Verificar que se expanden los subtratamientos
3. Verificar que las imágenes de subtratamientos se muestran correctamente

## ⚡ Próximos pasos

1. **Ejecutar script SQL**: `scripts/setup-bucket-imagenes.sql` en Supabase
2. **Probar subida de imágenes**: En gestión de tratamientos, subir una imagen nueva
3. **Verificar página institucional**: Confirmar que las imágenes se muestran
4. **Optimizar performance**: Si hay muchas imágenes, considerar lazy loading

## 🐛 Debugging si persisten problemas

### Si las imágenes aún no cargan:
1. **Verificar URL en navegador**: Copiar URL de imagen y abrir en incógnito
2. **Verificar consola**: Buscar errores 403, 404, o CORS
3. **Verificar políticas**: Ejecutar consulta de verificación en el script SQL
4. **Verificar RLS**: Asegurar que Row Level Security esté habilitado en storage.objects

### Si hay problemas de altura:
1. **Inspeccionar elementos**: Verificar que contenedores tengan altura CSS
2. **Verificar estilos**: Asegurar que no hay conflictos de CSS
3. **Verificar responsive**: Probar en diferentes tamaños de pantalla

## 📁 Archivos modificados
- ✅ `app/institucional/InstitucionalClient.tsx` - Componente principal corregido
- ✅ `components/ui/optimized-image.tsx` - Nuevo componente de imagen
- ✅ `scripts/setup-bucket-imagenes.sql` - Script de configuración del bucket
- ✅ `supabase/migrations/20240330000002_setup_imagenes_bucket.sql` - Migración del bucket

## 🔗 Enlaces útiles
- [Documentación Supabase Storage](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Row Level Security en Storage](https://supabase.com/docs/guides/storage/security/access-control) 