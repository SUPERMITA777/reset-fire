const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use specific variable

console.log('🔍 Verificando configuración...');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
console.log('Service Role Key:', supabaseServiceKey ? '✅ Configurada' : '❌ Faltante');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan las variables de entorno de Supabase para ejecutar migraciones.');
  if (!supabaseUrl) {
    console.error('  - NEXT_PUBLIC_SUPABASE_URL no está definida.');
  }
  if (!supabaseServiceKey) {
    console.error('  - SUPABASE_SERVICE_ROLE_KEY no está definida. Esta clave es necesaria para operaciones administrativas como las migraciones.');
  }
  console.error('');
  console.error('📁 Archivos verificados para estas variables: .env.local, .env');
  console.error('');
  console.error('💡 Asegúrate de que los archivos existan y contengan las variables correctas.');
  console.error('   La clave anónima (NEXT_PUBLIC_SUPABASE_ANON_KEY) no es suficiente para ejecutar migraciones.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey); // Use the service key

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
      // This relies on a pre-existing PL/pgSQL function `exec_sql(sql_query TEXT)` in the database,
      // which is expected to execute the provided SQL string (the content of the migration file).
      // An example definition for such a function (which should be created by a privileged user, like a superuser, in the DB):
      // CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
      // RETURNS VOID AS $$
      // BEGIN
      //   EXECUTE sql_query;
      // END;
      // $$ LANGUAGE plpgsql SECURITY DEFINER;
      // The SECURITY DEFINER clause allows the function to run with the permissions of the role that defined it,
      // ensuring it has rights for DDL operations, though using SUPABASE_SERVICE_ROLE_KEY in the script
      // already provides high privileges to the client.
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

// Note: The createExecSqlFunction was removed as it was not being called within this script
// and its logic for creating 'exec_sql' by calling 'exec_sql' was circular.
// This script assumes that the 'exec_sql(sql_query TEXT)' PL/pgSQL function already exists
// in the database, typically created with SECURITY DEFINER by a superuser role.
// Such a function allows the execution of arbitrary SQL strings passed to it, which is
// necessary for running multi-statement migration files.
// While the SUPABASE_SERVICE_ROLE_KEY provides high privileges to the script's client,
// the exec_sql function pattern is a common way to manage SQL script execution.

// Ejecutar migraciones
runMigrations().catch(console.error);