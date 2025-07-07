# 📱 Reset Fire Mobile - Instalación en iPhone

## 🎯 Resumen

Esta aplicación móvil te permite gestionar citas y tratamientos de tu clínica estética directamente desde tu iPhone, usando la misma base de datos Supabase que tu aplicación web.

---

## ⚠️ Requisitos Importantes

### **Sistema Operativo:**
- **macOS** (requerido para desarrollo iOS)
- Windows solo permite desarrollo para Android

### **Software Necesario:**
- [Xcode](https://apps.apple.com/app/xcode/id497799835) (App Store)
- [Node.js](https://nodejs.org/) (v16 o superior)
- [CocoaPods](https://cocoapods.org/) (se instala automáticamente)

### **Dispositivos:**
- iPhone con iOS 13.4 o superior
- Cable USB para conectar iPhone

---

## 🚀 Instalación Rápida

### **Paso 1: Configuración Automática**
```bash
# En macOS, desde el directorio mobile-app
chmod +x scripts/setup-ios.sh
./scripts/setup-ios.sh
```

### **Paso 2: Conectar iPhone**
1. Conectar iPhone por USB
2. Confiar en el certificado de desarrollador
3. Ejecutar: `npx react-native run-ios --device`

---

## 📋 Instalación Detallada

### **1. Preparar el Entorno**
```bash
# Verificar que estás en macOS
uname -s  # Debe mostrar "Darwin"

# Instalar Xcode desde App Store
# Instalar Node.js desde https://nodejs.org/
```

### **2. Configurar el Proyecto**
```bash
# Navegar al directorio
cd mobile-app

# Instalar dependencias
npm install

# Copiar credenciales de Supabase
node scripts/copiar-credenciales.js
```

### **3. Configurar Xcode**
```bash
# Abrir proyecto en Xcode
open ios/ResetFireMobile.xcworkspace

# En Xcode:
# 1. Project → ResetFireMobile
# 2. Signing & Capabilities
# 3. Team: Tu cuenta de Apple Developer
# 4. Bundle Identifier: com.tuempresa.resetfiremobile
```

### **4. Instalar Dependencias iOS**
```bash
cd ios
pod install
cd ..
```

---

## 📱 Métodos de Instalación

### **Opción 1: Desarrollo Directo (Recomendado)**
```bash
# Conectar iPhone por USB
# Ejecutar en terminal
npx react-native run-ios --device
```

### **Opción 2: Desde Xcode**
1. Abrir `ios/ResetFireMobile.xcworkspace`
2. Seleccionar tu iPhone como destino
3. Presionar ▶️ (Play)

### **Opción 3: Archivo IPA**
```bash
# Construir archivo de distribución
./scripts/build-ios.sh

# Exportar IPA
./scripts/export-ipa.sh

# Instalar via iTunes/Finder
```

### **Opción 4: TestFlight (Beta)**
1. Subir a App Store Connect desde Xcode
2. Configurar TestFlight
3. Invitar usuarios por email
4. Instalar desde TestFlight

---

## 🔧 Scripts Disponibles

### **Configuración Automática**
```bash
./scripts/setup-ios.sh
```
- Verifica requisitos
- Instala dependencias
- Copia credenciales
- Configura Xcode

### **Construcción**
```bash
./scripts/build-ios.sh
```
- Construye aplicación para dispositivo
- Crea archivo .xcarchive

### **Exportación**
```bash
./scripts/export-ipa.sh
```
- Exporta archivo .ipa
- Listo para distribución

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

# Reconectar iPhone
# Reiniciar Xcode
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

### **Error: "Metro bundler"**
```bash
# Limpiar caché
npx react-native start --reset-cache

# En otra terminal
npx react-native run-ios --device
```

---

## 📱 Funcionalidades

### **Calendario de Citas**
- ✅ Vista mensual con citas marcadas
- ✅ Selección de fechas
- ✅ Lista de citas del día
- ✅ Estados con códigos de color

### **Gestión de Citas**
- ✅ Crear nuevas citas
- ✅ Editar citas existentes
- ✅ Cambiar estados (Reservado, Confirmado, Completado, Cancelado)
- ✅ Búsqueda automática de clientes

### **Sincronización**
- ✅ Conexión directa con Supabase
- ✅ Datos en tiempo real
- ✅ Mismas funcionalidades que la web

---

## 🔄 Actualizaciones

### **Actualizar Código**
```bash
# Detener Metro bundler (Ctrl+C)
git pull
npm install
npx react-native run-ios --device
```

### **Nueva Versión**
```bash
./scripts/build-ios.sh
./scripts/export-ipa.sh
```

---

## 📞 Soporte

### **Logs Útiles**
- **Xcode Console:** Ver logs de la aplicación
- **Metro bundler:** Terminal donde ejecutaste el comando
- **iPhone logs:** Configuración → Privacidad → Análisis

### **Recursos**
- [Documentación React Native](https://reactnative.dev/)
- [Guía Xcode](https://developer.apple.com/xcode/)
- [Documentación Supabase](https://supabase.com/docs)

---

## 🎯 Próximos Pasos

1. **Probar todas las funcionalidades**
2. **Configurar notificaciones push**
3. **Optimizar rendimiento**
4. **Preparar para App Store**

---

## 📖 Documentación Completa

Para información detallada, consulta:
- `INSTALACION_IPHONE_COMPLETA.md` - Guía paso a paso
- `README.md` - Documentación general del proyecto

¡La aplicación está lista para usar con tu base de datos Supabase en tu iPhone! 