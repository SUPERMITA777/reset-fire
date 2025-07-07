@echo off
echo 🪟 Configurando Reset Fire Mobile para Windows...

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json
    echo Asegúrate de estar en el directorio mobile-app
    pause
    exit /b 1
)

REM Verificar que Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar que Android Studio está configurado
if "%ANDROID_HOME%"=="" (
    echo ⚠️  ADVERTENCIA: ANDROID_HOME no está configurado
    echo Por favor configura las variables de entorno de Android Studio:
    echo set ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk
    echo set PATH=%PATH%;%ANDROID_HOME%\emulator
    echo set PATH=%PATH%;%ANDROID_HOME%\tools
    echo set PATH=%PATH%;%ANDROID_HOME%\tools\bin
    echo set PATH=%PATH%;%ANDROID_HOME%\platform-tools
)

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

REM Copiar credenciales de Supabase
echo 🔧 Copiando credenciales de Supabase...
node scripts/copiar-credenciales.js

REM Verificar que el archivo .env se creó correctamente
if not exist ".env" (
    echo ❌ Error: No se pudo crear el archivo .env
    echo Por favor verifica que existe el archivo .env.local en el proyecto principal
    pause
    exit /b 1
)

REM Limpiar y construir el proyecto Android
echo 🔨 Limpiando y construyendo proyecto Android...
cd android
call gradlew clean
cd ..

echo ✅ Configuración completada!
echo.
echo 📱 Para ejecutar la aplicación:
echo    npx react-native run-android
echo.
echo 🔧 Para abrir en Android Studio:
echo    start android
echo.
echo ⚠️  Asegúrate de tener un emulador Android ejecutándose o un dispositivo conectado
pause 