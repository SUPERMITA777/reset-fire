# 🪟 Guía de Instalación en Windows

## 🎯 Prueba la App en Modo Virtual desde Windows

Esta guía te permitirá probar la aplicación móvil Reset Fire en un emulador Android desde Windows, usando las mismas credenciales de tu base de datos Supabase.

---

## 📋 Requisitos Previos

### **Software Necesario:**
- [ ] **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
- [ ] **Android Studio** - [Descargar](https://developer.android.com/studio)
- [ ] **Java Development Kit (JDK)** - [Descargar](https://adoptium.net/)

### **Configuración de Android Studio:**
1. Instalar Android Studio
2. Configurar Android SDK
3. Crear un emulador Android
4. Configurar variables de entorno

---

## 🚀 Instalación Automática (Recomendado)

### **Paso 1: Clonar el Proyecto**
```bash
# Clonar el proyecto principal (si no lo tienes)
git clone <tu-repositorio>
cd mobile-app
```

### **Paso 2: Ejecutar Script de Configuración**
```bash
# En Windows Command Prompt
scripts\setup-windows.bat

# O en PowerShell
.\scripts\setup-windows.bat
```

**El script automáticamente:**
- ✅ Instala dependencias de Node.js
- ✅ Copia credenciales de Supabase desde tu proyecto principal
- ✅ Configura el proyecto Android
- ✅ Verifica la configuración

---

## 🔧 Instalación Manual

### **Paso 1: Instalar Dependencias**
```bash
npm install
```

### **Paso 2: Configurar Credenciales**
El script automático copia las credenciales desde tu archivo `.env.local`. Si necesitas hacerlo manualmente:

1. **Copiar credenciales:**
```bash
node scripts/copiar-credenciales.js
```

2. **O crear manualmente `mobile-app/.env`:**
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
APP_NAME=Reset Fire Mobile
APP_BUNDLE_ID=com.tuempresa.resetfiremobile
```

### **Paso 3: Configurar Variables de Entorno**
En Windows, agregar al PATH:
```
ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\emulator
PATH=%PATH%;%ANDROID_HOME%\tools
PATH=%PATH%;%ANDROID_HOME%\tools\bin
PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

---

## 📱 Ejecutar la Aplicación

### **Opción 1: Emulador Android**
1. **Abrir Android Studio**
2. **Iniciar AVD Manager** (Tools → AVD Manager)
3. **Crear/Iniciar emulador**
4. **Ejecutar aplicación:**
```bash
npx react-native run-android
```

### **Opción 2: Dispositivo Físico**
1. **Habilitar modo desarrollador** en tu Android
2. **Habilitar depuración USB**
3. **Conectar por USB**
4. **Ejecutar:**
```bash
npx react-native run-android
```

---

## 🔍 Verificar Instalación

### **Comandos de Verificación:**
```bash
# Verificar Node.js
node --version

# Verificar React Native CLI
npx react-native --version

# Verificar dispositivos conectados
adb devices

# Verificar emuladores
emulator -list-avds
```

### **Verificar Conexión a Supabase:**
La aplicación mostrará en consola:
```
✅ Credenciales copiadas exitosamente
🔗 URL de Supabase: https://tuproyecto.supabase.co
🔑 Clave anónima: eyJhbGciOiJIUzI1NiIs...
```

---

## 🐛 Solución de Problemas

### **Error: "ANDROID_HOME not set"**
```bash
# Configurar variable de entorno
set ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

### **Error: "No emulator found"**
1. Abrir Android Studio
2. Tools → AVD Manager
3. Create Virtual Device
4. Seleccionar dispositivo (ej: Pixel 4)
5. Seleccionar imagen (ej: API 33)
6. Finish

### **Error: "Build failed"**
```bash
# Limpiar build
cd android
gradlew clean
cd ..

# Reinstalar dependencias
npm install
```

### **Error: "Metro bundler"**
```bash
# Limpiar caché
npx react-native start --reset-cache

# En otra terminal
npx react-native run-android
```

### **Error: "Credentials not found"**
```bash
# Verificar que existe .env.local en el proyecto principal
# Ejecutar script de copia
node scripts/copiar-credenciales.js
```

---

## 📱 Funcionalidades Disponibles

Una vez ejecutada la aplicación, podrás:

### **Calendario:**
- ✅ Ver citas por fecha
- ✅ Indicadores visuales de estados
- ✅ Navegación entre meses

### **Gestión de Citas:**
- ✅ Crear nuevas citas
- ✅ Editar citas existentes
- ✅ Cambiar estados
- ✅ Búsqueda de clientes

### **Sincronización:**
- ✅ Conexión directa con tu base de datos
- ✅ Datos en tiempo real
- ✅ Mismas funcionalidades que la web

---

## 🔄 Actualizaciones

### **Para actualizar la aplicación:**
```bash
# Detener Metro bundler (Ctrl+C)
# Actualizar código
git pull

# Reinstalar dependencias (si es necesario)
npm install

# Ejecutar nuevamente
npx react-native run-android
```

### **Para limpiar completamente:**
```bash
# Limpiar caché
npx react-native start --reset-cache

# Limpiar build Android
cd android
gradlew clean
cd ..

# Reinstalar dependencias
rm -rf node_modules
npm install
```

---

## 📞 Soporte

### **Logs Útiles:**
- **Metro bundler:** Terminal donde ejecutaste `npx react-native run-android`
- **Android logs:** `adb logcat`
- **React Native logs:** F12 en el emulador

### **Recursos:**
- [Documentación React Native](https://reactnative.dev/)
- [Guía Android Studio](https://developer.android.com/studio)
- [Documentación Supabase](https://supabase.com/docs)

---

## 🎯 Próximos Pasos

1. **Probar todas las funcionalidades**
2. **Configurar notificaciones push**
3. **Optimizar rendimiento**
4. **Preparar para producción**

¡La aplicación está lista para usar con tu base de datos Supabase! 