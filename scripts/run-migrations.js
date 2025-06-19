const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuración...');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ Faltante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('📁 Archivos verificados:');
  console.error('- .env.local');
  console.error('- .env');
  console.error('');
  console.error('💡 Asegúrate de que los archivos existan y contengan las variables correctas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🚀 Iniciando ejecución de migraciones...');
  
  // Obtener todas las migraciones
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ No se encontró el directorio de migraciones');
    return;
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ejecutar en orden alfabético
  
  console.log(`📁 Encontradas ${migrationFiles.length} migraciones`);
  
  // Crear tabla de migraciones si no existe
  await createMigrationsTable();
  
  for (const file of migrationFiles) {
    const migrationName = path.basename(file, '.sql');
    
    // Verificar si ya se ejecutó
    const { data: executed } = await supabase
      .from('schema_migrations')
      .select('version')
      .eq('version', migrationName)
      .single();
    
    if (executed) {
      console.log(`⏭️  Saltando ${migrationName} (ya ejecutado)`);
      continue;
    }
    
    console.log(`🔄 Ejecutando ${migrationName}...`);
    
    try {
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Ejecutar la migración
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error(`❌ Error en ${migrationName}:`, error);
        continue;
      }
      
      // Marcar como ejecutado
      await supabase
        .from('schema_migrations')
        .insert({ version: migrationName, executed_at: new Date().toISOString() });
      
      console.log(`✅ ${migrationName} ejecutado correctamente`);
      
    } catch (error) {
      console.error(`❌ Error ejecutando ${migrationName}:`, error.message);
    }
  }
  
  console.log('🎉 Migraciones completadas');
}

async function createMigrationsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });
  
  if (error && !error.message.includes('already exists')) {
    console.error('❌ Error creando tabla de migraciones:', error);
  }
}

// Función auxiliar para ejecutar SQL
async function createExecSqlFunction() {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });
  
  if (error) {
    console.error('❌ Error creando función exec_sql:', error);
  }
}

// Ejecutar migraciones
runMigrations().catch(console.error); 