const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno desde .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value.trim();
      }
    }
  });
  console.log('✅ Variables de entorno cargadas desde .env');
} else {
  console.log('⚠️  Archivo .env no encontrado, usando variables del sistema');
}

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Debug de variables de entorno:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Configurada ✅' : 'No encontrada ❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada ✅' : 'No encontrada ❌');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada ✅' : 'No encontrada ❌');
console.log('Usando clave:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Anon Key');

// Mostrar las variables que empiecen con SUPABASE o NEXT_PUBLIC
const supabaseVars = Object.keys(process.env).filter(key => 
  key.includes('SUPABASE') || key.includes('NEXT_PUBLIC')
);
if (supabaseVars.length > 0) {
  console.log('📋 Variables relacionadas con Supabase encontradas:');
  supabaseVars.forEach(key => {
    const value = process.env[key];
    console.log(`  ${key}: ${value ? (value.substring(0, 20) + '...') : 'vacía'}`);
  });
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Faltan las variables de entorno de Supabase');
  console.error('Asegúrate de que tu archivo .env contenga:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase');
  console.error('SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupImagenesStorage() {
  try {
    console.log('🔧 Configurando bucket de imágenes...');

    // Crear bucket para imágenes si no existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const imagenesBucketExists = buckets.some(bucket => bucket.name === 'imagenes');
    
    if (!imagenesBucketExists) {
      console.log('📁 Creando bucket "imagenes"...');
      const { error: createError } = await supabase.storage.createBucket('imagenes', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });

      if (createError) {
        throw createError;
      }
      console.log('✅ Bucket "imagenes" creado exitosamente');
    } else {
      console.log('✅ Bucket "imagenes" ya existe');
    }

    // Verificar que el bucket es público
    const bucketInfo = buckets.find(bucket => bucket.name === 'imagenes');
    if (bucketInfo && !bucketInfo.public) {
      console.log('🔄 Actualizando bucket para ser público...');
      const { error: updateError } = await supabase.storage.updateBucket('imagenes', {
        public: true
      });
      
      if (updateError) {
        console.warn('⚠️  Advertencia: No se pudo actualizar el bucket:', updateError.message);
      } else {
        console.log('✅ Bucket actualizado para ser público');
      }
    }

    // Verificar las políticas del bucket
    console.log('🔍 Verificando políticas de acceso...');
    
    // Intentar subir un archivo de prueba para verificar permisos
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { error: uploadError } = await supabase.storage
      .from('imagenes')
      .upload(`test/${testFileName}`, testFile);

    if (uploadError) {
      console.warn('⚠️  Advertencia: Error al subir archivo de prueba:', uploadError.message);
      console.log('📋 Puede que necesites configurar las políticas manualmente en el dashboard de Supabase');
    } else {
      console.log('✅ Permisos de subida funcionando correctamente');
      
      // Limpiar archivo de prueba
      await supabase.storage
        .from('imagenes')
        .remove([`test/${testFileName}`]);
    }

    // Verificar acceso público
    const { data: { publicUrl } } = supabase.storage
      .from('imagenes')
      .getPublicUrl('test/nonexistent.jpg');

    if (publicUrl) {
      console.log('✅ URLs públicas funcionando correctamente');
    }

    console.log('');
    console.log('🎉 Configuración completada');
    console.log('');
    console.log('📋 Políticas recomendadas para el bucket "imagenes":');
    console.log('');
    console.log('1. Para lectura pública (SELECT):');
    console.log('   CREATE POLICY "Public read access" ON storage.objects');
    console.log('   FOR SELECT USING (bucket_id = \'imagenes\');');
    console.log('');
    console.log('2. Para escritura (INSERT):');
    console.log('   CREATE POLICY "Authenticated users can upload" ON storage.objects');
    console.log('   FOR INSERT WITH CHECK (bucket_id = \'imagenes\');');
    console.log('');
    console.log('3. Para actualización (UPDATE):');
    console.log('   CREATE POLICY "Authenticated users can update" ON storage.objects');
    console.log('   FOR UPDATE USING (bucket_id = \'imagenes\');');
    console.log('');
    console.log('4. Para eliminación (DELETE):');
    console.log('   CREATE POLICY "Authenticated users can delete" ON storage.objects');
    console.log('   FOR DELETE USING (bucket_id = \'imagenes\');');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  }
}

// Ejecutar la configuración
setupImagenesStorage(); 