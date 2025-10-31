# 💰 Calculadora BCV - Web App

Aplicación web para convertir USD a Bolívares usando la tasa oficial del Banco Central de Venezuela (BCV).

## ✨ Características

- 🔄 Obtiene la tasa oficial del BCV automáticamente (USD y EUR)
- 💵 Calculadora para múltiples cantidades en USD, EUR o USDT
- ₮ Soporte para USDT con tasas de Binance P2P
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

3. Configura Upstash Redis (requerido para producción):

   - Ve al dashboard de Vercel → Storage → Create Database → Upstash
   - Conecta la base de datos a tu proyecto
   - Las variables de entorno se configuran automáticamente con nombres específicos de tu proyecto

4. Configura las variables de entorno:

   - Crea un archivo `.env.local` en la raíz del proyecto
   - Agrega las siguientes variables:

   ```
   # Binance API Keys (opcional - solo necesario si API requiere autenticación)
   BINANCE_API_KEY=tu_api_key_aqui
   BINANCE_SECRET_KEY=tu_secret_key_aqui

   # Credenciales de administración
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=tu_password_seguro
   JWT_SECRET=tu_secret_jwt_aleatorio_muy_seguro

   # Upstash Redis (configurado automáticamente por Vercel en producción)
   # Los nombres de las variables dependen de tu configuración en Vercel
   # Ejemplo: tasa_KV_REST_API_URL, tasa_KV_REST_API_TOKEN
   # O estándar: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
   tasa_KV_REST_API_URL=tu_url_aqui
   tasa_KV_REST_API_TOKEN=tu_token_aqui

   # (Opcional) Si prefieres usar hash de password en lugar de texto plano:
   # ADMIN_PASSWORD_HASH=hash_generado_con_bcrypt
   ```

   - **Nota**: Las tasas de USDT desde Binance P2P funcionan sin API keys ya que el endpoint es público
   - **Importante**: Cambia `ADMIN_PASSWORD` y `JWT_SECRET` por valores seguros en producción
   - **Redis**: En producción, las variables de Upstash se configuran automáticamente por Vercel

5. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

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
│   ├── auth.js              # Funciones de autenticación
│   ├── bcv.js               # Lógica del scraper BCV (reutilizable)
│   ├── binance.js           # Lógica para obtener tasas de Binance P2P
│   ├── redis.js             # Cliente Redis y helpers
│   ├── scraping-monitor.js  # Monitoreo de scraping
│   └── visits.js            # Gestión de visitas
├── scraper.js               # Script CLI original
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

1. La aplicación carga automáticamente la tasa según la pestaña seleccionada:
   - **USD/EUR**: Tasa oficial del BCV
   - **USDT**: Tasa promedio de Binance P2P (compra y venta para transacciones de 100 USDT)
2. Selecciona la pestaña de la moneda que deseas usar (USD, EUR o USDT)
3. Ingresa cantidades en la moneda seleccionada (separadas por comas o espacios)
   - Ejemplo: `100, 20, 40` o `100 20 40`
4. Haz clic en "Calcular"
5. Verás el resultado con:
   - Lista de cantidades ingresadas
   - Suma total en la moneda seleccionada
   - Tipo de cambio utilizado
   - Total en Bolívares

## 🔧 Tecnologías

- **Next.js 14** - Framework React
- **React 18** - Biblioteca UI
- **Axios** - Cliente HTTP
- **Cheerio** - Parser HTML (server-side)
- **Upstash Redis** - Almacenamiento de datos (visitas y scraping status)
- **bcryptjs** - Hash de passwords
- **jsonwebtoken** - Autenticación JWT
- **ua-parser-js** - Parse de user agents
- **Vercel** - Plataforma de despliegue

## 📝 Notas

- La tasa se cachea por 5 minutos para mejorar el rendimiento
- Si hay un error al obtener la tasa nueva, se usa la tasa en caché (si existe)
- **USD y EUR**: Usan la tasa oficial del Banco Central de Venezuela (BCV)
- **USDT**: Usa la tasa promedio de Binance P2P calculada a partir de las ofertas de compra y venta para transacciones de 100 USDT
- La aplicación es completamente responsive y funciona en móviles

## 🔑 Configuración de Variables de Entorno

### API Keys de Binance (Opcional)

Las tasas de USDT desde Binance P2P funcionan sin API keys ya que el endpoint es público. Sin embargo, si Binance requiere autenticación en el futuro:

1. Obtén tus API keys desde: https://www.binance.com/en/my/settings/api-management
2. Agrega las variables `BINANCE_API_KEY` y `BINANCE_SECRET_KEY` a tu `.env.local`

### Credenciales de Administración

El panel de administración requiere configurar credenciales:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:
   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=tu_password_seguro
   JWT_SECRET=tu_secret_jwt_aleatorio_muy_seguro
   ```
3. El archivo `.env.local` está en `.gitignore` y no se subirá al repositorio

### Panel de Administración

Accede al panel de administración en `/admin`:

- **Login**: `/admin`
- **Dashboard**: `/admin/dashboard` (requiere autenticación)

El panel muestra:

- Estado de scraping (BCV USD/EUR y Binance USDT)
- Estadísticas de visitas (totales, del día, historial completo)
- Detalles de cada visita (IP, navegador, dispositivo, etc.)

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
