# 📱 Guía Completa de Instalación en iPhone

## 🎯 Instalar Reset Fire Mobile en tu iPhone

Esta guía te permitirá crear e instalar la aplicación móvil Reset Fire en tu iPhone, usando las mismas credenciales de tu base de datos Supabase.

---

## 📋 Requisitos Previos

### **Software Necesario:**
- [ ] **macOS** (requerido para desarrollo iOS)
- [ ] **Xcode** (App Store) - Versión 14.0 o superior
- [ ] **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
- [ ] **Cuenta de Apple Developer** (gratuita para desarrollo)

### **Dispositivos:**
- [ ] **iPhone** con iOS 13.4 o superior
- [ ] **Cable USB** para conectar iPhone

---

## 🚀 Instalación Automática

### **Paso 1: Preparar el Proyecto**
```bash
# Clonar el proyecto (si no lo tienes)
git clone <tu-repositorio>
cd mobile-app

# Ejecutar configuración automática
chmod +x scripts/setup-ios.sh
./scripts/setup-ios.sh
```

### **Paso 2: Configurar Credenciales**
El script automáticamente copia las credenciales desde tu archivo `.env.local`. Si necesitas hacerlo manualmente:

```bash
# Copiar credenciales de Supabase
node scripts/copiar-credenciales.js
```

### **Paso 3: Construir la Aplicación**
```bash
# Construir para dispositivo
chmod +x scripts/build-ios.sh
./scripts/build-ios.sh
```

---

## 🔧 Instalación Manual

### **Paso 1: Instalar Dependencias**
```bash
npm install
```

### **Paso 2: Configurar Supabase**
1. **Verificar archivo `.env.local`** en el proyecto principal
2. **Ejecutar script de copia:**
```bash
node scripts/copiar-credenciales.js
```

### **Paso 3: Configurar Xcode**
1. **Abrir Xcode**
2. **Abrir proyecto:** `ios/ResetFireMobile.xcworkspace`
3. **Seleccionar equipo de desarrollo:**
   - Project → ResetFireMobile
   - Signing & Capabilities
   - Team: Tu cuenta de Apple Developer
   - Bundle Identifier: `com.tuempresa.resetfiremobile`

### **Paso 4: Instalar Dependencias iOS**
```bash
cd ios
pod install
cd ..
```

---

## 📱 Instalar en iPhone

### **Opción 1: Desarrollo Directo (Recomendado)**

1. **Conectar iPhone por USB**
2. **Confiar en el certificado:**
   - iPhone: Configuración → General → Gestión de dispositivos
   - Confiar en tu certificado de desarrollador

3. **Ejecutar desde Xcode:**
   - Seleccionar tu iPhone como destino
   - Presionar ▶️ (Play)

4. **O desde terminal:**
```bash
npx react-native run-ios --device
```

### **Opción 2: Instalación por Archivo**

1. **Construir archivo de distribución:**
```bash
chmod +x scripts/export-ipa.sh
./scripts/export-ipa.sh
```

2. **Instalar IPA:**
   - Conectar iPhone por USB
   - Abrir iTunes/Finder
   - Ir a pestaña de aplicaciones
   - Arrastrar archivo `.ipa`

### **Opción 3: TestFlight (Beta Testing)**

1. **Subir a App Store Connect:**
   - Xcode → Product → Archive
   - Distribute App → App Store Connect

2. **Configurar TestFlight:**
   - App Store Connect → TestFlight
   - Agregar usuarios internos/externos

3. **Instalar desde TestFlight:**
   - Recibir invitación por email
   - Descargar TestFlight desde App Store
   - Instalar la app

---

## 🔍 Verificar Instalación

### **Comandos de Verificación:**
```bash
# Verificar dispositivos conectados
xcrun devicectl list devices

# Verificar certificados
security find-identity -v -p codesigning

# Verificar configuración de Supabase
node scripts/copiar-credenciales.js
```

### **Verificar en iPhone:**
- ✅ App aparece en pantalla de inicio
- ✅ Se abre sin errores
- ✅ Muestra calendario de citas
- ✅ Conecta con tu base de datos

---

## 🐛 Solución de Problemas

### **Error: "No provisioning profile"**
```bash
# En Xcode:
# 1. Project → Signing & Capabilities
# 2. Marcar "Automatically manage signing"
# 3. Seleccionar tu equipo
```

### **Error: "Device not found"**
```bash
# Verificar dispositivos
xcrun devicectl list devices

# Reiniciar Xcode
# Reconectar iPhone
```

### **Error: "Build failed"**
```bash
# Limpiar build
cd ios
xcodebuild clean
cd ..

# Reinstalar pods
cd ios
pod deintegrate
pod install
cd ..
```

### **Error: "Credentials not found"**
```bash
# Verificar archivo .env.local
# Ejecutar script de copia
node scripts/copiar-credenciales.js
```

### **Error: "Metro bundler"**
```bash
# Limpiar caché
npx react-native start --reset-cache

# En otra terminal
npx react-native run-ios --device
```

---

## 📱 Funcionalidades Disponibles

Una vez instalada la aplicación:

### **Calendario:**
- ✅ Vista mensual con citas marcadas
- ✅ Selección de fechas
- ✅ Lista de citas del día
- ✅ Estados con códigos de color

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
npx react-native run-ios --device
```

### **Para nueva versión:**
```bash
# Construir nueva versión
./scripts/build-ios.sh

# Exportar IPA
./scripts/export-ipa.sh
```

---

## 📞 Soporte

### **Logs Útiles:**
- **Xcode Console:** Ver logs de la aplicación
- **Metro bundler:** Terminal donde ejecutaste `npx react-native run-ios`
- **iPhone logs:** Configuración → Privacidad y Seguridad → Análisis y Mejoras

### **Recursos:**
- [Documentación React Native](https://reactnative.dev/)
- [Guía Xcode](https://developer.apple.com/xcode/)
- [Documentación Supabase](https://supabase.com/docs)

---

## 🎯 Próximos Pasos

1. **Probar todas las funcionalidades**
2. **Configurar notificaciones push**
3. **Optimizar rendimiento**
4. **Preparar para App Store**

¡La aplicación está lista para usar con tu base de datos Supabase en tu iPhone! 