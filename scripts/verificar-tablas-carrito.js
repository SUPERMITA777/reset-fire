require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarTablas() {
  console.log('🔍 Verificando tablas del carrito...')
  
  const tablas = [
    'rf_productos',
    'rf_transacciones',
    'rf_carrito_compras',
    'rf_carrito_items'
  ]

  for (const tabla of tablas) {
    try {
      console.log(`\n📋 Verificando tabla: ${tabla}`)
      
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .limit(1)

      if (error) {
        console.error(`❌ Error en ${tabla}:`, error.message)
      } else {
        console.log(`✅ ${tabla} existe y es accesible`)
        
        // Si hay datos, mostrar estructura
        if (data && data.length > 0) {
          console.log(`   📊 Columnas disponibles:`, Object.keys(data[0]))
        }
      }
    } catch (error) {
      console.error(`❌ Error verificando ${tabla}:`, error.message)
    }
  }

  // Verificar productos específicamente
  console.log('\n🛍️ Verificando productos...')
  try {
    const { data: productos, error } = await supabase
      .from('rf_productos')
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ Error consultando productos:', error)
    } else {
      console.log(`✅ Productos encontrados: ${productos.length}`)
      productos.forEach((producto, index) => {
        console.log(`   ${index + 1}. ${producto.nombre} - $${producto.precio}`)
      })
    }
  } catch (error) {
    console.error('❌ Error verificando productos:', error)
  }
}

verificarTablas() 