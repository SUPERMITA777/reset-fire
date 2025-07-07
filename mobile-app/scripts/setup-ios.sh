#!/bin/bash

echo "🍎 Configurando Reset Fire Mobile para iOS..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "Ejecuta este script desde el directorio mobile-app"
    exit 1
fi

# Verificar que estamos en macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: Este script debe ejecutarse en macOS"
    echo "iOS development requiere macOS y Xcode"
    exit 1
fi

# Verificar que Xcode está instalado
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode no está instalado"
    echo "Por favor instala Xcode desde la App Store"
    exit 1
fi

# Verificar que CocoaPods está instalado
if ! command -v pod &> /dev/null; then
    echo "📦 Instalando CocoaPods..."
    sudo gem install cocoapods
fi

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo "✅ Verificaciones completadas"

# Instalar dependencias de Node.js
echo "📦 Instalando dependencias de Node.js..."
npm install

# Copiar credenciales de Supabase
echo "🔧 Copiando credenciales de Supabase..."
if [ -f "../.env.local" ]; then
    node scripts/copiar-credenciales.js
    echo "✅ Credenciales copiadas correctamente"
else
    echo "⚠️  No se encontró .env.local en el proyecto principal"
    echo "Por favor crea el archivo .env manualmente con tus credenciales de Supabase"
fi

# Instalar dependencias de iOS
echo "🍎 Instalando dependencias de iOS..."
cd ios
pod install
cd ..

# Verificar que el workspace se creó correctamente
if [ ! -d "ios/ResetFireMobile.xcworkspace" ]; then
    echo "❌ Error: No se pudo crear el workspace de Xcode"
    echo "Verifica que CocoaPods se instaló correctamente"
    exit 1
fi

echo "✅ Configuración completada"
echo ""
echo "🎯 Próximos pasos:"
echo "1. Abrir Xcode: open ios/ResetFireMobile.xcworkspace"
echo "2. Configurar tu equipo de desarrollo en Signing & Capabilities"
echo "3. Conectar tu iPhone por USB"
echo "4. Ejecutar: npx react-native run-ios --device"
echo ""
echo "📖 Para más información, consulta: INSTALACION_IPHONE_COMPLETA.md" 