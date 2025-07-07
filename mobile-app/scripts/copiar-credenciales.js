const fs = require('fs')
const path = require('path')

console.log('🔧 Copiando credenciales de Supabase...')

// Rutas de los archivos
const envLocalPath = path.join(__dirname, '..', '..', '.env.local')
const envPath = path.join(__dirname, '..', '.env')

// Función para leer archivo .env.local
function readEnvFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      const envVars = {}
      
      content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=')
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim()
        }
      })
      
      return envVars
    }
    return null
  } catch (error) {
    console.error('Error leyendo archivo:', error)
    return null
  }
}

// Función para escribir archivo .env
function writeEnvFile(filePath, envVars) {
  try {
    let content = '# Configuración de Supabase para Reset Fire Mobile\n'
    content += '# Copiado automáticamente desde el proyecto principal\n\n'
    
    if (envVars.NEXT_PUBLIC_SUPABASE_URL) {
      content += `NEXT_PUBLIC_SUPABASE_URL=${envVars.NEXT_PUBLIC_SUPABASE_URL}\n`
    }
    
    if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      content += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY}\n`
    }
    
    content += '\n# Configuración de la aplicación\n'
    content += 'APP_NAME=Reset Fire Mobile\n'
    content += 'APP_BUNDLE_ID=com.tuempresa.resetfiremobile\n'
    
    fs.writeFileSync(filePath, content)
    return true
  } catch (error) {
    console.error('Error escribiendo archivo:', error)
    return false
  }
}

// Leer credenciales del proyecto principal
const envVars = readEnvFile(envLocalPath)

if (!envVars) {
  console.log('❌ No se encontró el archivo .env.local en el proyecto principal')
  console.log('💡 Asegúrate de que existe el archivo .env.local con las credenciales de Supabase')
  process.exit(1)
}

// Verificar que las credenciales necesarias estén presentes
if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('❌ Faltan credenciales de Supabase en .env.local')
  console.log('💡 Asegúrate de que el archivo .env.local contenga:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima')
  process.exit(1)
}

// Escribir archivo .env para la app móvil
if (writeEnvFile(envPath, envVars)) {
  console.log('✅ Credenciales copiadas exitosamente')
  console.log('📁 Archivo creado: mobile-app/.env')
  console.log('🔗 URL de Supabase:', envVars.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔑 Clave anónima:', envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...')
} else {
  console.log('❌ Error al copiar las credenciales')
  process.exit(1) 