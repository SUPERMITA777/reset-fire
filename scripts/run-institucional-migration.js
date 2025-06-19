require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runInstitucionalMigration() {
  console.log('🚀 Iniciando migración para página institucional...');
  
  try {
    // 1. Agregar campos a rf_tratamientos
    console.log('🔄 Agregando campos a rf_tratamientos...');
    const { error: errorTratamientos } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE rf_tratamientos 
        ADD COLUMN IF NOT EXISTS foto_url TEXT,
        ADD COLUMN IF NOT EXISTS descripcion TEXT;
      `
    });
    
    if (errorTratamientos) {
      console.error('❌ Error al agregar campos a rf_tratamientos:', errorTratamientos);
    } else {
      console.log('✅ Campos agregados a rf_tratamientos');
    }
    
    // 2. Agregar campos a rf_subtratamientos
    console.log('🔄 Agregando campos a rf_subtratamientos...');
    const { error: errorSubtratamientos } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE rf_subtratamientos 
        ADD COLUMN IF NOT EXISTS foto_url TEXT,
        ADD COLUMN IF NOT EXISTS descripcion TEXT;
      `
    });
    
    if (errorSubtratamientos) {
      console.error('❌ Error al agregar campos a rf_subtratamientos:', errorSubtratamientos);
    } else {
      console.log('✅ Campos agregados a rf_subtratamientos');
    }
    
    // 3. Verificar que los campos se agregaron correctamente
    console.log('🔍 Verificando estructura de tablas...');
    
    const { data: tratamientosColumns, error: errorTratamientosCheck } = await supabase.rpc('get_table_columns', {
      table_name: 'rf_tratamientos'
    });
    
    if (errorTratamientosCheck) {
      console.error('❌ Error al verificar rf_tratamientos:', errorTratamientosCheck);
    } else {
      console.log('📊 Columnas de rf_tratamientos:', tratamientosColumns.map(col => col.column_name));
    }
    
    const { data: subtratamientosColumns, error: errorSubtratamientosCheck } = await supabase.rpc('get_table_columns', {
      table_name: 'rf_subtratamientos'
    });
    
    if (errorSubtratamientosCheck) {
      console.error('❌ Error al verificar rf_subtratamientos:', errorSubtratamientosCheck);
    } else {
      console.log('📊 Columnas de rf_subtratamientos:', subtratamientosColumns.map(col => col.column_name));
    }
    
    console.log('🎉 Migración para página institucional completada');
    
  } catch (error) {
    console.error('❌ Error general en la migración:', error);
  }
}

// Ejecutar migración
runInstitucionalMigration().catch(console.error); 