# 💰 Calculadora BCV - Web App

Aplicación web para convertir USD a Bolívares usando la tasa oficial del Banco Central de Venezuela (BCV).

## ✨ Características

- 🔄 Obtiene la tasa oficial del BCV automáticamente
- 💵 Calculadora para múltiples cantidades en USD
- 📱 Diseño responsive optimizado para móviles
- ⚡ Caché de tasa para mejor rendimiento
- 🚀 Desplegada en Vercel

## 🚀 Desarrollo Local

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

1. Clona el repositorio o navega al directorio:
```bash
cd bcv
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📦 Script CLI (Original)

Si prefieres usar el script de línea de comandos original:

```bash
npm run scraper
# o
node scraper.js
```

## 🌐 Despliegue en Vercel

### Opción 1: Despliegue Automático desde GitHub

1. Sube el código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Inicia sesión con tu cuenta de GitHub
4. Haz clic en "New Project"
5. Importa tu repositorio
6. Vercel detectará automáticamente que es un proyecto Next.js
7. Haz clic en "Deploy"
8. ¡Listo! Tu aplicación estará disponible en una URL de Vercel

### Opción 2: Despliegue desde CLI

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Desde el directorio del proyecto:
```bash
vercel
```

3. Sigue las instrucciones en pantalla

### Opción 3: Conectar con Vercel Dashboard

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio de GitHub
3. Configura automáticamente (Next.js se detecta automáticamente)
4. Deploy

## 📁 Estructura del Proyecto

```
/home/duran/bcv/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── tasa/route.js   # API: Obtener tasa BCV
│   │   └── calcular/route.js # API: Calcular conversión
│   ├── layout.js           # Layout principal
│   ├── page.js             # Página principal
│   └── globals.css          # Estilos globales
├── components/             # Componentes React
│   ├── TasaDisplay.js      # Componente para mostrar tasa
│   └── Resultado.js        # Componente para mostrar resultados
├── lib/
│   └── bcv.js              # Lógica del scraper (reutilizable)
├── scraper.js              # Script CLI original
├── package.json
├── next.config.js
├── vercel.json
└── README.md
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run scraper` - Ejecuta el script CLI original

## 📱 Uso

1. La aplicación carga automáticamente la tasa del BCV
2. Ingresa cantidades en USD (separadas por comas o espacios)
   - Ejemplo: `100, 20, 40` o `100 20 40`
3. Haz clic en "Calcular"
4. Verás el resultado con:
   - Lista de cantidades ingresadas
   - Suma total en USD
   - Tipo de cambio utilizado
   - Total en Bolívares

## 🔧 Tecnologías

- **Next.js 14** - Framework React
- **React 18** - Biblioteca UI
- **Axios** - Cliente HTTP
- **Cheerio** - Parser HTML (server-side)
- **Vercel** - Plataforma de despliegue

## 📝 Notas

- La tasa se cachea por 5 minutos para mejorar el rendimiento
- Si hay un error al obtener la tasa nueva, se usa la tasa en caché (si existe)
- La aplicación es completamente responsive y funciona en móviles

## 🐛 Solución de Problemas

### Error al obtener la tasa del BCV

- Verifica tu conexión a internet
- El sitio del BCV puede estar temporalmente no disponible
- Intenta actualizar la tasa manualmente con el botón "Actualizar tasa"

### Error en el despliegue en Vercel

- Asegúrate de que todas las dependencias estén en `package.json`
- Verifica que el build funcione localmente: `npm run build`
- Revisa los logs en el dashboard de Vercel

## 📄 Licencia

Este proyecto es de uso personal.
