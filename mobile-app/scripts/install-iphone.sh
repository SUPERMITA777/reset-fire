#!/bin/bash

echo "📱 Instalando Reset Fire Mobile en iPhone..."

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

# Verificar que el iPhone está conectado
echo "📱 Verificando dispositivos conectados..."
xcrun devicectl list devices

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Instalar pods
echo "🍎 Instalando dependencias de iOS..."
cd ios
pod install
cd ..

# Verificar configuración de Supabase
echo "🔧 Verificando configuración de Supabase..."
if grep -q "TU_SUPABASE_URL" src/lib/supabase.ts; then
    echo "⚠️  IMPORTANTE: Actualiza las credenciales de Supabase en src/lib/supabase.ts"
    echo "   - Abre src/lib/supabase.ts"
    echo "   - Reemplaza TU_SUPABASE_URL con tu URL real"
    echo "   - Reemplaza TU_SUPABASE_ANON_KEY con tu clave real"
    read -p "¿Has actualizado las credenciales? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Por favor actualiza las credenciales antes de continuar"
        exit 1
    fi
fi

# Construir y instalar
echo "🔨 Construyendo aplicación..."
npx react-native run-ios --device

echo "✅ ¡Instalación completada!"
echo ""
echo "📱 La aplicación debería estar instalada en tu iPhone"
echo "🔧 Para desarrollo futuro, usa: npx react-native run-ios --device" 