require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Verificando datos en las tablas...\n');

  // Verificar tratamientos
  console.log('📋 Consultando rf_tratamientos...');
  const { data: tratamientos, error: errorTratamientos } = await supabase
    .from('rf_tratamientos')
    .select('*');

  if (errorTratamientos) {
    console.error('❌ Error al obtener tratamientos:', errorTratamientos);
  } else {
    console.log('✅ Tratamientos encontrados:', tratamientos);
  }

  // Verificar disponibilidad
  console.log('\n📋 Consultando rf_disponibilidad...');
  const { data: disponibilidad, error: errorDisponibilidad } = await supabase
    .from('rf_disponibilidad')
    .select(`
      *,
      tratamientos:rf_tratamientos(id, nombre_tratamiento)
    `);

  if (errorDisponibilidad) {
    console.error('❌ Error al obtener disponibilidad:', errorDisponibilidad);
  } else {
    console.log('✅ Disponibilidad encontrada:', disponibilidad);
  }

  // Verificar la estructura de la tabla
  console.log('\n📋 Verificando estructura de rf_disponibilidad...');
  const { data: columns, error: errorColumns } = await supabase
    .rpc('get_table_columns', { table_name: 'rf_disponibilidad' });

  if (errorColumns) {
    console.error('❌ Error al obtener estructura:', errorColumns);
  } else {
    console.log('✅ Estructura de la tabla:', columns);
  }
}

checkData().catch(console.error); 