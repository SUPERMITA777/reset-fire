#!/bin/bash

echo "🚀 Configurando proyecto Android para Reset Fire Mobile..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Instalar dependencias de Node.js
echo "📦 Instalando dependencias de Node.js..."
npm install

# Verificar que Android Studio está instalado
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Error: ANDROID_HOME no está configurado."
    echo "Por favor instala Android Studio y configura las variables de entorno:"
    echo "export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    exit 1
fi

# Verificar que el emulador está disponible
echo "📱 Verificando emuladores disponibles..."
emulator -list-avds

# Configurar variables de entorno
echo "🔧 Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Configuración de Supabase
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima

# Configuración de la aplicación
APP_NAME=Reset Fire Mobile
APP_PACKAGE_NAME=com.tuempresa.resetfiremobile
EOF
    echo "⚠️  IMPORTANTE: Actualiza el archivo .env con tus credenciales de Supabase"
fi

# Limpiar y construir el proyecto
echo "🔨 Limpiando y construyendo el proyecto..."
cd android
./gradlew clean
cd ..

echo "✅ Configuración completada!"
echo ""
echo "📱 Para ejecutar la aplicación:"
echo "   npx react-native run-android"
echo ""
echo "🔧 Para abrir en Android Studio:"
echo "   open android/"
echo ""
echo "⚠️  Recuerda actualizar las credenciales de Supabase en src/lib/supabase.ts" 