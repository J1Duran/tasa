# Plan: Sistema de Registro de Consultas USDT

## Objetivo
Implementar un sistema para que los usuarios puedan registrar sus consultas de USDT cuando deseen, almacenarlas localmente y ver un reporte mensual de sus registros.

## Decisión: localStorage vs sessionStorage
**Recomendación: localStorage**
- Los datos persisten entre sesiones (el usuario puede cerrar el navegador y los datos siguen ahí)
- Permite acumular registros mensuales a largo plazo
- Accesible desde cualquier pestaña del mismo dominio
- Ideal para reportes mensuales que el usuario quiere mantener

## Estructura de Implementación

### 1. Almacenamiento de Datos (localStorage)
- **Clave**: `usdt_registros`
- **Estructura de datos**:
```javascript
{
  registros: [
    {
      id: string (timestamp + random),
      fecha: string (ISO),
      precioIngresado: number,
      monedaOrigen: string ("Bs" | "USD" | "EUR"),
      precioBolivares: number,
      tasaVentaUsdt: number,
      tasaBCV: number | null,
      usdtNecesarios: number
    }
  ]
}
```

### 2. Funcionalidades a Implementar

#### A. Checkbox de Registro
- Ubicación: En el tab "Calculadora" (CALC), antes o después del botón "Calcular USDT"
- Estado: Controlado por un estado `shouldRegister` en `app/page.js`
- Comportamiento:
  - Si está marcado, al calcular y obtener resultado exitoso, se guarda automáticamente
  - Si no está marcado, no se registra nada
  - El checkbox puede estar marcado por defecto o no (decidir UX)

#### B. Utilidad de Gestión de Registros (lib/usdt-registros.js)
Crear funciones helper:
- `guardarRegistro(resultado)` - Guarda un nuevo registro
- `obtenerRegistros()` - Obtiene todos los registros
- `eliminarRegistro(id)` - Elimina un registro específico
- `eliminarRegistrosPorMes(mes, año)` - Elimina todos los registros de un mes
- `obtenerRegistrosPorMes(mes, año)` - Filtra registros por mes/año
- `obtenerEstadisticasMensuales(mes, año)` - Calcula estadísticas (total USDT, promedio, etc.)

#### C. Componente de Visualización de Registros (components/RegistrosUSDT.js)
Nuevo componente que mostrará:
- Lista de registros filtrados por mes
- Selector de mes/año para filtrar
- Estadísticas del mes seleccionado:
  - Total de consultas
  - Total USDT calculado
  - Promedio USDT por consulta
  - Total en bolos (suma de precioBolivares)
- Botón para eliminar registro individual
- Botón para eliminar todos los registros del mes
- Opción para exportar datos (JSON o CSV) - opcional pero útil

#### D. Integración en la UI Principal
- Añadir un nuevo tab "Mis Registros" en el componente `Tabs.js`
- O añadir un botón/link en el tab Calculadora que lleve a los registros
- Mostrar el componente `RegistrosUSDT` cuando esté activo ese tab/área

### 3. Flujo de Usuario

1. Usuario va al tab "Calculadora"
2. Ingresa un precio y marca el checkbox "Registrar esta consulta"
3. Hace clic en "Calcular USDT"
4. Si el cálculo es exitoso y el checkbox está marcado, se guarda automáticamente en localStorage
5. Usuario puede ir a "Mis Registros" para ver todas sus consultas
6. Puede filtrar por mes y ver estadísticas
7. Puede eliminar registros individuales o por mes completo

### 4. Archivos a Crear/Modificar

**Nuevos archivos:**
- `lib/usdt-registros.js` - Funciones de gestión de registros
- `components/RegistrosUSDT.js` - Componente de visualización

**Archivos a modificar:**
- `app/page.js` - Añadir checkbox, estado `shouldRegister`, lógica de guardado
- `components/Tabs.js` - Añadir nuevo tab "Mis Registros" (opcional)
- `components/ResultadoCalculadora.js` - Posiblemente añadir indicador visual si se guardó

### 5. Consideraciones de UX

- Mensaje de confirmación cuando se guarda un registro (toast/notificación breve)
- Confirmación antes de eliminar registros (especialmente eliminar mes completo)
- Formato de fecha legible en español
- Números formateados con separadores de miles y decimales
- Diseño responsive y consistente con el resto de la app

### 6. Validaciones

- Verificar que localStorage esté disponible antes de usar
- Manejar errores de almacenamiento (localStorage lleno, etc.)
- Validar estructura de datos al leer de localStorage

## Orden de Implementación

1. ✅ Crear `lib/usdt-registros.js` con funciones básicas
2. ✅ Añadir checkbox y estado en `app/page.js`
3. ✅ Integrar guardado automático en `calculateUSDT`
4. ✅ Crear componente `RegistrosUSDT.js`
5. ✅ Añadir tab/sección para ver registros
6. ✅ Implementar filtrado por mes
7. ✅ Añadir estadísticas mensuales
8. ✅ Implementar eliminación de registros
9. ✅ Añadir confirmaciones y mensajes de feedback
10. ✅ Testing y ajustes finales

## Notas Técnicas

- Usar `crypto.randomUUID()` o `Date.now() + Math.random()` para IDs únicos
- Formatear fechas con `Intl.DateTimeFormat` para español
- Limitar el tamaño de datos almacenados (considerar límite de localStorage ~5-10MB)
- Considerar añadir compresión o paginación si hay muchos registros

