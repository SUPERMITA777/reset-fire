const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Faltan las variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProductosStorage() {
  try {
    console.log('Configurando bucket de productos...');

    // Crear bucket para productos si no existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const productosBucketExists = buckets.some(bucket => bucket.name === 'productos');
    
    if (!productosBucketExists) {
      console.log('Creando bucket "productos"...');
      const { error: createError } = await supabase.storage.createBucket('productos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });

      if (createError) {
        throw createError;
      }
      console.log('✅ Bucket "productos" creado exitosamente');
    } else {
      console.log('✅ Bucket "productos" ya existe');
    }

    // Configurar políticas de acceso público para el bucket
    console.log('Configurando políticas de acceso...');
    
    // Política para permitir lectura pública
    const { error: policyError } = await supabase.storage
      .from('productos')
      .createSignedUrl('test.jpg', 60); // Esto verifica que las políticas estén configuradas

    if (policyError && !policyError.message.includes('not found')) {
      console.warn('⚠️  Advertencia: Las políticas de acceso pueden necesitar configuración manual');
    }

    console.log('✅ Configuración completada');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Ejecuta la migración de la tabla de productos');
    console.log('2. Verifica que el bucket esté configurado en el dashboard de Supabase');
    console.log('3. Configura las políticas RLS si es necesario');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  }
}

setupProductosStorage(); 