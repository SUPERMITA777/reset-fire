@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    📱 INSTALACIÓN EN IPHONE - GUÍA
echo ========================================
echo.

echo ⚠️  IMPORTANTE: Para instalar en iPhone necesitas:
echo.
echo 📋 REQUISITOS:
echo    ✅ macOS (no Windows)
echo    ✅ Xcode instalado
echo    ✅ iPhone con iOS 13.4+
echo    ✅ Cable USB
echo    ✅ Cuenta de Apple Developer
echo.

echo 🍎 OPCIONES PARA INSTALAR EN IPHONE:
echo.
echo 1️⃣  DESARROLLO DIRECTO (Recomendado):
echo    - Conectar iPhone por USB a Mac
echo    - Abrir Xcode
echo    - Ejecutar: npx react-native run-ios --device
echo.
echo 2️⃣  TESTFLIGHT (Beta Testing):
echo    - Subir a App Store Connect
echo    - Invitar usuarios por email
echo    - Instalar desde TestFlight
echo.
echo 3️⃣  DISTRIBUCIÓN INTERNA:
echo    - Crear archivo .ipa
echo    - Usar herramientas como Diawi
echo    - Compartir link de descarga
echo.

echo 📖 GUÍA COMPLETA:
echo    Abre el archivo: INSTALACION_IPHONE_COMPLETA.md
echo.

echo 🔧 SCRIPTS DISPONIBLES (en macOS):
echo    ./scripts/setup-ios.sh     - Configuración automática
echo    ./scripts/build-ios.sh     - Construir aplicación
echo    ./scripts/export-ipa.sh    - Exportar para distribución
echo.

echo 💡 CONSEJOS:
echo    - La app usa las mismas credenciales de Supabase
echo    - Funciona offline con sincronización automática
echo    - Incluye todas las funcionalidades de la web
echo.

echo 🚀 PRÓXIMOS PASOS:
echo    1. Usar una Mac con Xcode
echo    2. Ejecutar: ./scripts/setup-ios.sh
echo    3. Conectar iPhone y ejecutar la app
echo.

pause 