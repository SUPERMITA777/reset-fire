#!/bin/bash

echo "📦 Exportando IPA para distribución..."

# Verificar que existe el archivo .xcarchive
if [ ! -d "ios/ResetFireMobile.xcarchive" ]; then
    echo "❌ Error: No se encontró el archivo .xcarchive"
    echo "Ejecuta primero: ./scripts/build-ios.sh"
    exit 1
fi

# Crear archivo de configuración de exportación
echo "📝 Creando configuración de exportación..."
cat > ios/exportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>compileBitcode</key>
    <false/>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
EOF

echo "⚠️  IMPORTANTE: Actualiza YOUR_TEAM_ID en ios/exportOptions.plist con tu Team ID de Apple Developer"

# Exportar IPA
echo "🔨 Exportando IPA..."
cd ios
xcodebuild -exportArchive -archivePath ResetFireMobile.xcarchive -exportPath ./build -exportOptionsPlist exportOptions.plist

# Verificar si la exportación fue exitosa
if [ $? -eq 0 ]; then
    echo "✅ Exportación exitosa!"
    echo "📱 Archivo IPA creado en ios/build/ResetFireMobile.ipa"
    echo ""
    echo "🎯 Para instalar en iPhone:"
    echo "1. Conectar iPhone por USB"
    echo "2. Abrir iTunes/Finder"
    echo "3. Ir a la pestaña de aplicaciones"
    echo "4. Arrastrar el archivo .ipa"
    echo ""
    echo "📤 Para distribuir:"
    echo "- TestFlight: Subir a App Store Connect"
    echo "- Distribución interna: Usar herramientas como Diawi o TestFlight"
else
    echo "❌ Error en la exportación"
    exit 1
fi

cd .. 