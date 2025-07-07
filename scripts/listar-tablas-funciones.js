require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listarTablasYFunciones() {
  try {
    console.log('🔍 Listando tablas y funciones en Supabase...')
    console.log('============================================')
    
    // Listar tablas usando una consulta SQL directa
    console.log('\n📊 TABLAS DISPONIBLES:')
    console.log('======================')
    
    // Intentar listar tablas directamente
    const { data: tablas, error: errorTablas } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')
    
    if (errorTablas) {
      console.log('❌ No se pudieron listar las tablas:', errorTablas.message)
    } else {
      console.log('✅ Tablas encontradas:')
      tablas.forEach(tabla => {
        console.log(`   - ${tabla.table_name}`)
      })
    }
    
    // Listar funciones usando consulta SQL directa
    console.log('\n⚙️  FUNCIONES RPC DISPONIBLES:')
    console.log('==============================')
    
    const { data: funciones, error: errorFunciones } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_type', 'FUNCTION')
      .order('routine_name')
    
    if (errorFunciones) {
      console.log('❌ No se pudieron listar las funciones:', errorFunciones.message)
    } else {
      console.log('✅ Funciones encontradas:')
      funciones.forEach(funcion => {
        console.log(`   - ${funcion.routine_name}`)
      })
    }
    
    // Listar vistas
    console.log('\n👁️  VISTAS DISPONIBLES:')
    console.log('======================')
    
    const { data: vistas, error: errorVistas } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')
    
    if (errorVistas) {
      console.log('❌ No se pudieron listar las vistas:', errorVistas.message)
    } else {
      if (vistas.length > 0) {
        console.log('✅ Vistas encontradas:')
        vistas.forEach(vista => {
          console.log(`   - ${vista.table_name}`)
        })
      } else {
        console.log('ℹ️  No hay vistas en el esquema público')
      }
    }
    
    console.log('\n🎉 Listado completado!')
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message)
  }
}

listarTablasYFunciones() 