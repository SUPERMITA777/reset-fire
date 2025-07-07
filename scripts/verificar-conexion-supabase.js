require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

const { createClient } = require('@supabase/supabase-js')

// Verificar variables de entorno
console.log('🔍 Verificando variables de entorno...')
console.log('=====================================')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL no está configurada')
  console.log('💡 Crea un archivo .env.local con:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co')
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
}

if (!supabaseAnonKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada')
  console.log('💡 Crea un archivo .env.local con:')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui')
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 20) + '...')
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n🚨 Variables de entorno faltantes. No se puede probar la conexión.')
  console.log('\n📋 Pasos para configurar:')
  console.log('1. Ve a https://supabase.com/dashboard')
  console.log('2. Selecciona tu proyecto')
  console.log('3. Ve a Settings > API')
  console.log('4. Copia la URL y anon key')
  console.log('5. Crea un archivo .env.local en la raíz del proyecto')
  console.log('6. Agrega las variables de entorno')
  process.exit(1)
}

console.log('\n🔌 Probando conexión a Supabase...')
console.log('==================================')

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verificarConexion() {
  try {
    // Probar conexión básica
    console.log('📡 Probando conexión básica...')
    const { data, error } = await supabase
      .from('rf_tratamientos')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Conexión exitosa - Tabla rf_tratamientos vacía')
      } else if (error.code === '42P01') {
        console.log('⚠️  Conexión exitosa - Tabla rf_tratamientos no existe')
        console.log('💡 Necesitas ejecutar las migraciones')
      } else {
        console.log('❌ Error de conexión:', error.message)
        console.log('🔍 Código de error:', error.code)
        return false
      }
    } else {
      console.log('✅ Conexión exitosa - Datos obtenidos correctamente')
    }

    // Probar otras tablas importantes
    console.log('\n📊 Verificando tablas principales...')
    
    const tablas = [
      'rf_tratamientos',
      'rf_subtratamientos', 
      'rf_citas',
      'rf_clientes',
      'fechas_disponibles',
      'rf_fechas_disponibles',
      'horarios_disponibles',
      'rf_horarios_disponibles'
    ]

    for (const tabla of tablas) {
      try {
        const { error: tableError } = await supabase
          .from(tabla)
          .select('id')
          .limit(1)
        
        if (tableError) {
          if (tableError.code === '42P01') {
            console.log(`❌ Tabla '${tabla}' no existe`)
          } else {
            console.log(`⚠️  Error en tabla '${tabla}':`, tableError.message)
          }
        } else {
          console.log(`✅ Tabla '${tabla}' existe y es accesible`)
        }
      } catch (err) {
        console.log(`❌ Error verificando tabla '${tabla}':`, err.message)
      }
    }

    // Probar funciones RPC
    console.log('\n⚙️  Verificando funciones RPC...')
    const funciones = [
      'verificar_configuracion',
      'obtener_horarios_disponibles',
      'verificar_disponibilidad',
      'crear_cita_multiple',
      'obtener_fechas_disponibles'
    ]
    
    for (const funcion of funciones) {
      try {
        const { error: rpcError } = await supabase.rpc(funcion)
        if (rpcError) {
          if (rpcError.code === '42883') {
            console.log(`⚠️  Función '${funcion}' no existe`)
          } else {
            console.log(`⚠️  Error en función '${funcion}':`, rpcError.message)
          }
        } else {
          console.log(`✅ Función RPC '${funcion}' funciona`)
        }
      } catch (err) {
        console.log(`❌ Error probando función '${funcion}':`, err.message)
      }
    }

    console.log('\n🎉 Verificación completada!')
    return true

  } catch (error) {
    console.log('❌ Error inesperado:', error.message)
    return false
  }
}

// Ejecutar verificación
verificarConexion()
  .then((exitoso) => {
    if (exitoso) {
      console.log('\n✅ La conexión a Supabase está funcionando correctamente')
    } else {
      console.log('\n❌ Hay problemas con la conexión a Supabase')
    }
  })
  .catch((error) => {
    console.log('\n💥 Error fatal:', error.message)
  }) 