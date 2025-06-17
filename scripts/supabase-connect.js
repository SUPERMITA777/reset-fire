const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://tlgxtdfufjgcqunoighw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZ3h0ZGZ1ZmpnY3F1bm9pZ2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTY3MjAsImV4cCI6MjA2MzE5MjcyMH0.wlUKaKxFSs1IrP0stifQ7x1B2tL09MOs9STUNYaLoKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listarTablas() {
  console.log('📋 Listando tablas disponibles...\n');
  
  try {
    // Usar una consulta SQL directa para listar tablas
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 
    });
    
    if (error) throw error;
    
    console.log('Tablas encontradas:');
    data.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error al listar tablas:', error);
    
    // Si no existe la función exec_sql, intentar con tablas conocidas
    console.log('\nIntentando con tablas conocidas...');
    const tablasConocidas = [
      'rf_tratamientos',
      'rf_subtratamientos', 
      'rf_clientes',
      'rf_disponibilidad',
      'citas',
      'tratamientos',
      'sub_tratamientos',
      'clientes',
      'disponibilidad',
      'fechas_disponibles'
    ];
    
    for (const tabla of tablasConocidas) {
      try {
        const { error: testError } = await supabase
          .from(tabla)
          .select('id')
          .limit(1);
        
        if (!testError) {
          console.log(`  ✅ ${tabla}`);
        }
      } catch (e) {
        // Tabla no existe, continuar
      }
    }
  }
}

async function verDatosTabla(tabla) {
  console.log(`📊 Mostrando datos de la tabla: ${tabla}\n`);
  
  try {
    const { data, error } = await supabase
      .from(tabla)
      .select('*')
      .limit(10);
    
    if (error) throw error;
    
    console.log(`Datos de ${tabla}:`);
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error(`Error al obtener datos de ${tabla}:`, error);
  }
}

async function contarRegistros(tabla) {
  console.log(`🔢 Contando registros en: ${tabla}\n`);
  
  try {
    const { count, error } = await supabase
      .from(tabla)
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log(`Total de registros en ${tabla}: ${count}`);
    
  } catch (error) {
    console.error(`Error al contar registros de ${tabla}:`, error);
  }
}

async function ejecutarConsultaSQL(sql) {
  console.log(`🔍 Ejecutando consulta SQL:\n${sql}\n`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) throw error;
    
    console.log('Resultado:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error al ejecutar consulta SQL:', error);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const comando = args[0];
  
  switch (comando) {
    case 'tablas':
      await listarTablas();
      break;
      
    case 'datos':
      const tabla = args[1];
      if (!tabla) {
        console.log('Uso: node supabase-connect.js datos <nombre_tabla>');
        return;
      }
      await verDatosTabla(tabla);
      break;
      
    case 'contar':
      const tablaContar = args[1];
      if (!tablaContar) {
        console.log('Uso: node supabase-connect.js contar <nombre_tabla>');
        return;
      }
      await contarRegistros(tablaContar);
      break;
      
    case 'sql':
      const sql = args.slice(1).join(' ');
      if (!sql) {
        console.log('Uso: node supabase-connect.js sql "SELECT * FROM tabla"');
        return;
      }
      await ejecutarConsultaSQL(sql);
      break;
      
    default:
      console.log(`
🔧 Herramienta de conexión a Supabase

Uso:
  node supabase-connect.js tablas                    - Listar todas las tablas
  node supabase-connect.js datos <tabla>             - Ver datos de una tabla
  node supabase-connect.js contar <tabla>            - Contar registros de una tabla
  node supabase-connect.js sql "SELECT * FROM tabla" - Ejecutar consulta SQL

Ejemplos:
  node supabase-connect.js tablas
  node supabase-connect.js datos rf_tratamientos
  node supabase-connect.js contar citas
  node supabase-connect.js sql "SELECT COUNT(*) FROM rf_tratamientos"
      `);
  }
}

main().catch(console.error); 