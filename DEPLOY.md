# 🚀 Guía de Despliegue en Vercel

## Opción 1: GitHub + Vercel Dashboard (Más Fácil) ⭐

### Paso 1: Preparar y subir a GitHub

1. **Hacer commit inicial:**
```bash
git add .
git commit -m "Initial commit: BCV Calculator app"
```

2. **Crear repositorio en GitHub:**
   - Ve a https://github.com/new
   - Crea un nuevo repositorio (puede ser privado o público)
   - NO inicialices con README, .gitignore o licencia
   - Copia la URL del repositorio (ej: `https://github.com/tu-usuario/bcv-calculator.git`)

3. **Conectar y subir código:**
```bash
git remote add origin https://github.com/tu-usuario/bcv-calculator.git
git branch -M main
git push -u origin main
```

### Paso 2: Desplegar en Vercel

1. **Ve a Vercel:**
   - Abre https://vercel.com
   - Inicia sesión con tu cuenta de GitHub

2. **Importar proyecto:**
   - Haz clic en "Add New..." → "Project"
   - Selecciona tu repositorio `bcv-calculator`
   - Vercel detectará automáticamente que es Next.js

3. **Configurar proyecto:**
   - Framework Preset: **Next.js** (ya detectado)
   - Root Directory: `.` (raíz)
   - Build Command: `npm run build` (automático)
   - Output Directory: `.next` (automático)

4. **Desplegar:**
   - Haz clic en "Deploy"
   - Espera unos minutos mientras se construye y despliega
   - ¡Listo! Obtendrás una URL como: `https://tu-app.vercel.app`

---

## Opción 2: Vercel CLI (Rápida) ⚡

### Paso 1: Instalar Vercel CLI

```bash
npm i -g vercel
```

### Paso 2: Iniciar sesión

```bash
vercel login
```

### Paso 3: Desplegar

```bash
cd /home/duran/bcv
vercel
```

Sigue las instrucciones en pantalla:
- ¿Set up and deploy? → **Y**
- ¿Which scope? → Selecciona tu cuenta
- ¿Link to existing project? → **N**
- ¿What's your project's name? → `bcv-calculator` (o el que prefieras)
- ¿In which directory is your code located? → `./`

¡Listo! El despliegue comenzará automáticamente.

### Para desplegar a producción:

```bash
vercel --prod
```

---

## Opción 3: Arrastrar y Soltar (Más Simple) 🎯

1. **Ve a:** https://vercel.com/new
2. **Conecta tu cuenta de GitHub**
3. **Arrastra la carpeta del proyecto** o selecciónala
4. **Haz clic en "Deploy"**
5. ¡Listo!

---

## ✅ Verificar el Despliegue

Una vez desplegado, podrás:
- Ver tu app en `https://tu-app.vercel.app`
- Acceder desde cualquier dispositivo, incluido tu teléfono
- Cada push a GitHub automáticamente redesplegará la app

---

## 📱 Acceso desde tu Teléfono

Simplemente abre la URL de Vercel en el navegador de tu teléfono. La app es completamente responsive y funciona perfectamente en móviles.

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios y hagas push a GitHub, Vercel automáticamente:
1. Detectará los cambios
2. Construirá la nueva versión
3. La desplegará automáticamente

No necesitas hacer nada más que `git push`!

