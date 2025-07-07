#!/bin/bash

echo "🍎 Construyendo Reset Fire Mobile para iOS..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Verificar que Xcode está instalado
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode no está instalado"
    echo "Por favor instala Xcode desde la App Store"
    exit 1
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

# Instalar pods
echo "🍎 Instalando dependencias de iOS..."
cd ios
pod install
cd ..

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
cd ios
xcodebuild clean -workspace ResetFireMobile.xcworkspace -scheme ResetFireMobile
cd ..

# Construir para dispositivo
echo "🔨 Construyendo para dispositivo..."
cd ios
xcodebuild -workspace ResetFireMobile.xcworkspace -scheme ResetFireMobile -configuration Release -archivePath ResetFireMobile.xcarchive archive

# Verificar si la construcción fue exitosa
if [ $? -eq 0 ]; then
    echo "✅ Construcción exitosa!"
    echo "📱 Archivo .xcarchive creado en ios/ResetFireMobile.xcarchive"
    echo ""
    echo "🎯 Para instalar en iPhone:"
    echo "1. Abrir Xcode"
    echo "2. Window → Devices and Simulators"
    echo "3. Seleccionar tu iPhone"
    echo "4. Arrastrar el archivo .xcarchive a la lista de aplicaciones"
    echo ""
    echo "🔧 Para abrir en Xcode:"
    echo "open ios/ResetFireMobile.xcworkspace"
else
    echo "❌ Error en la construcción"
    exit 1
fi

cd .. 