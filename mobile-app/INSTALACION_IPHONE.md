# 📱 Guía de Instalación en iPhone

## 🎯 Opciones Disponibles

### **Opción 1: Desarrollo Directo (Recomendado)**
- ✅ Gratis
- ✅ Instalación directa
- ✅ Actualizaciones automáticas
- ❌ Requiere Mac con Xcode

### **Opción 2: TestFlight (Beta Testing)**
- ✅ Distribución fácil
- ✅ Sin Mac requerido
- ✅ Hasta 100 usuarios
- ❌ Requiere cuenta de desarrollador ($99/año)

### **Opción 3: App Store**
- ✅ Distribución pública
- ✅ Instalación fácil
- ❌ Requiere aprobación de Apple
- ❌ Cuenta de desarrollador ($99/año)

---

## 🚀 Instalación por Desarrollo (Opción 1)

### **Requisitos Previos:**
- [ ] Mac con macOS
- [ ] Xcode instalado (App Store)
- [ ] iPhone con iOS 13+
- [ ] Cable USB
- [ ] Cuenta de Apple ID

### **Paso 1: Preparar el Mac**
```bash
# Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Instalar React Native CLI
npm install -g react-native-cli
```

### **Paso 2: Clonar y Configurar**
```bash
# Clonar el proyecto
git clone <tu-repositorio>
cd mobile-app

# Instalar dependencias
npm install

# Ejecutar script de instalación
chmod +x scripts/install-iphone.sh
./scripts/install-iphone.sh
```

### **Paso 3: Configurar Credenciales**
1. Ve a tu proyecto de Supabase
2. Settings → API
3. Copia la URL y anon key
4. Edita `src/lib/supabase.ts`:
```typescript
const supabaseUrl = 'https://tuproyecto.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### **Paso 4: Conectar iPhone**
1. Conecta tu iPhone al Mac con cable USB
2. En el iPhone: Configuración → General → Gestión de dispositivos
3. Confía en tu certificado de desarrollador
4. Ejecuta: `npx react-native run-ios --device`

---

## 🧪 Instalación por TestFlight (Opción 2)

### **Requisitos:**
- [ ] Cuenta de desarrollador de Apple ($99/año)
- [ ] iPhone con iOS 13+

### **Pasos:**
1. **Preparar Build:**
```bash
cd ios
xcodebuild -workspace ResetFireMobile.xcworkspace -scheme ResetFireMobile -configuration Release archive
```

2. **Subir a App Store Connect:**
   - Abrir Xcode
   - Product → Archive
   - Distribute App → App Store Connect

3. **Configurar TestFlight:**
   - App Store Connect → TestFlight
   - Agregar usuarios internos/externos
   - Enviar invitaciones

4. **Instalar en iPhone:**
   - Recibir email de invitación
   - Descargar TestFlight desde App Store
   - Instalar la app desde TestFlight

---

## 🏪 Instalación desde App Store (Opción 3)

### **Requisitos:**
- [ ] Cuenta de desarrollador de Apple ($99/año)
- [ ] Aprobación de Apple

### **Pasos:**
1. **Preparar para producción:**
   - Configurar certificados
   - Generar build de producción
   - Subir a App Store Connect

2. **Proceso de revisión:**
   - Apple revisa la app (1-7 días)
   - Aprobación o rechazo con feedback

3. **Publicación:**
   - App disponible en App Store
   - Búsqueda: "Reset Fire Mobile"

---

## 🔧 Solución de Problemas

### **Error: "No provisioning profile"**
```bash
# En Xcode:
# 1. Seleccionar proyecto
# 2. Signing & Capabilities
# 3. Seleccionar tu equipo
# 4. Marcar "Automatically manage signing"
```

### **Error: "Device not found"**
```bash
# Verificar dispositivos conectados
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

### **Error: "Metro bundler"**
```bash
# Limpiar caché
npx react-native start --reset-cache

# En otra terminal
npx react-native run-ios --device
```

---

## 📞 Soporte

### **Para Desarrollo:**
- Revisar logs en Xcode
- Console de React Native
- Documentación oficial

### **Para TestFlight/App Store:**
- App Store Connect
- Apple Developer Support
- Guidelines de Apple

---

## 🎯 Recomendación

**Para empezar rápido:** Usa la **Opción 1 (Desarrollo Directo)**
- Es gratis
- Instalación directa
- Control total
- Actualizaciones inmediatas

**Para distribución:** Usa **TestFlight**
- Fácil distribución
- Hasta 100 usuarios
- Sin aprobación de Apple 