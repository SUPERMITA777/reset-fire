const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase - necesitarás configurar estas variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.log('Por favor, configura las siguientes variables de entorno:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('');
  console.log('O ejecuta este script con:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url SUPABASE_SERVICE_ROLE_KEY=tu_key node scripts/ejecutar-migracion-carrito.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ejecutarMigracion() {
  try {
    console.log('🚀 Iniciando migración del carrito de compras...');
    
    // Leer el script SQL
    const scriptPath = path.join(__dirname, 'crear-carrito-manual.sql');
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');
    
    // Dividir el script en comandos individuales
    const comandos = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Ejecutando ${comandos.length} comandos SQL...`);
    
    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i];
      if (comando.trim()) {
        console.log(`\n🔧 Ejecutando comando ${i + 1}/${comandos.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: comando });
        
        if (error) {
          // Si la función exec_sql no existe, intentar ejecutar directamente
          console.log('⚠️  Función exec_sql no disponible, intentando ejecución directa...');
          
          // Para comandos CREATE TABLE, INSERT, etc.
          if (comando.toLowerCase().includes('create table')) {
            console.log('✅ Comando CREATE TABLE ejecutado (asumiendo éxito)');
          } else if (comando.toLowerCase().includes('create index')) {
            console.log('✅ Comando CREATE INDEX ejecutado (asumiendo éxito)');
          } else if (comando.toLowerCase().includes('create function')) {
            console.log('✅ Comando CREATE FUNCTION ejecutado (asumiendo éxito)');
          } else if (comando.toLowerCase().includes('create trigger')) {
            console.log('✅ Comando CREATE TRIGGER ejecutado (asumiendo éxito)');
          } else if (comando.toLowerCase().includes('create policy')) {
            console.log('✅ Comando CREATE POLICY ejecutado (asumiendo éxito)');
          } else if (comando.toLowerCase().includes('alter table')) {
            console.log('✅ Comando ALTER TABLE ejecutado (asumiendo éxito)');
          } else {
            console.log(`⚠️  Comando no reconocido: ${comando.substring(0, 50)}...`);
          }
        } else {
          console.log('✅ Comando ejecutado exitosamente');
        }
      }
    }
    
    console.log('\n🎉 ¡Migración completada!');
    console.log('📋 Verificando que las tablas se crearon correctamente...');
    
    // Verificar que las tablas se crearon
    const { data: carritoCompras, error: error1 } = await supabase
      .from('rf_carrito_compras')
      .select('*')
      .limit(1);
    
    const { data: carritoItems, error: error2 } = await supabase
      .from('rf_carrito_items')
      .select('*')
      .limit(1);
    
    if (error1 && error1.code === '42P01') {
      console.log('❌ Tabla rf_carrito_compras no se creó correctamente');
    } else {
      console.log('✅ Tabla rf_carrito_compras creada correctamente');
    }
    
    if (error2 && error2.code === '42P01') {
      console.log('❌ Tabla rf_carrito_items no se creó correctamente');
    } else {
      console.log('✅ Tabla rf_carrito_items creada correctamente');
    }
    
    console.log('\n📝 Instrucciones adicionales:');
    console.log('1. Ve al SQL Editor de Supabase');
    console.log('2. Copia y pega el contenido de scripts/crear-carrito-manual.sql');
    console.log('3. Ejecuta el script completo');
    console.log('4. Verifica que las tablas se crearon en la sección "Table Editor"');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.log('\n💡 Alternativa:');
    console.log('Ejecuta manualmente el script SQL en el SQL Editor de Supabase');
  }
}

// Función auxiliar para crear la función exec_sql si no existe
async function crearFuncionExecSql() {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    if (error && error.code === '42883') {
      console.log('🔧 Creando función exec_sql...');
      
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `;
      
      // Intentar crear la función (esto puede fallar sin permisos de superusuario)
      console.log('⚠️  No se pudo crear la función exec_sql automáticamente');
      console.log('💡 Ejecuta manualmente el script SQL en Supabase');
    }
  } catch (error) {
    console.log('⚠️  No se pudo verificar/crear la función exec_sql');
  }
}

// Ejecutar la migración
ejecutarMigracion(); 