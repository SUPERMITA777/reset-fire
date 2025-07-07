#!/bin/bash

echo "🪟 Configurando Reset Fire Mobile para Windows..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar que Android Studio está configurado
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ADVERTENCIA: ANDROID_HOME no está configurado"
    echo "Por favor configura las variables de entorno de Android Studio:"
    echo "export ANDROID_HOME=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk"
    echo "export PATH=\$PATH:\$ANDROID_HOME\\emulator"
    echo "export PATH=\$PATH:\$ANDROID_HOME\\tools"
    echo "export PATH=\$PATH:\$ANDROID_HOME\\tools\\bin"
    echo "export PATH=\$PATH:\$ANDROID_HOME\\platform-tools"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Copiar credenciales de Supabase
echo "🔧 Copiando credenciales de Supabase..."
node scripts/copiar-credenciales.js

# Verificar que el archivo .env se creó correctamente
if [ ! -f ".env" ]; then
    echo "❌ Error: No se pudo crear el archivo .env"
    echo "Por favor verifica que existe el archivo .env.local en el proyecto principal"
    exit 1
fi

# Limpiar y construir el proyecto Android
echo "🔨 Limpiando y construyendo proyecto Android..."
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
echo "⚠️  Asegúrate de tener un emulador Android ejecutándose o un dispositivo conectado" 