# Plan: Aclaración del "Promedio USDT" en Estadísticas

## Situación Actual

### Cálculo Actual

```javascript
promedioUsdt: parseFloat((totalUsdt / registros.length).toFixed(2));
```

Esto significa:

- **Suma todos los USDT necesarios** de todas las consultas del mes
- **Divide entre el número de consultas**
- **Resultado**: Promedio de USDT necesarios por consulta

### Ejemplo

Si tienes 3 consultas en el mes:

- Consulta 1: 100 USDT necesarios
- Consulta 2: 200 USDT necesarios
- Consulta 3: 150 USDT necesarios

**Total USDT**: 450 USDT
**Promedio USDT**: 450 / 3 = **150 USDT por consulta**

## Interpretación Actual

**"Promedio USDT"** = **Promedio de USDT necesarios por consulta**

Esto responde a: _"En promedio, ¿cuántos USDT necesito vender en cada consulta?"_

## ¿Es Esto Útil?

### Ventajas del cálculo actual:

✅ Muestra el tamaño promedio de tus operaciones
✅ Útil para entender patrones de uso
✅ Ayuda a identificar si haces consultas grandes o pequeñas

### Posibles Confusiones:

❓ Podría confundirse con "promedio de tasa de venta USDT"
❓ No es claro si es "por consulta" o "por día"
❓ El nombre podría ser más descriptivo

## Opciones de Mejora

### Opción 1: Mantener el cálculo pero mejorar la etiqueta ⭐ RECOMENDADA

**Cambiar el label de:**

- "Promedio USDT"

**A:**

- "Promedio USDT por consulta"
- O: "USDT promedio por operación"

**Ventajas:**

- Más claro qué representa
- No cambia la lógica
- Fácil de implementar

### Opción 2: Añadir estadísticas adicionales

Mantener "Promedio USDT" pero añadir:

- **Promedio diario**: Total USDT / días del mes con registros
- **Tasa promedio**: Promedio de tasa de venta USDT usada
- **Mínimo/Máximo**: Rango de USDT en las consultas

### Opción 3: Cambiar el concepto

En lugar de promedio simple, mostrar:

- **Mediana**: Valor del medio (menos afectado por outliers)
- **Moda**: Valor más frecuente
- **Rango**: Mínimo y máximo

### Opción 4: Mostrar múltiples promedios

- Promedio por consulta (actual)
- Promedio por día (si hay múltiples consultas por día)
- Promedio de tasa de venta USDT

## Recomendación

**Opción 1 + Opción 2 (parcial)**: Mejorar la etiqueta y añadir estadísticas útiles

### Cambios Propuestos:

1. **Mejorar labels**:

   - "Promedio USDT" → "USDT promedio por consulta"
   - "Promedio bolos" → "Bolos promedio por consulta"

2. **Añadir estadísticas adicionales**:

   - **USDT mínimo**: Menor cantidad de USDT en una consulta
   - **USDT máximo**: Mayor cantidad de USDT en una consulta
   - **Tasa promedio USDT**: Promedio de la tasa de venta usada

3. **Mejorar la visualización**:
   - Mostrar las estadísticas en cards más claras
   - Agrupar por categorías (operaciones, montos, tasas)

## Implementación Propuesta

### Nuevas funciones en `lib/usdt-registros.js`:

```javascript
// Añadir a obtenerEstadisticasMensuales:
- usdtMinimo: Math.min(...registros.map(r => r.usdtNecesarios))
- usdtMaximo: Math.max(...registros.map(r => r.usdtNecesarios))
- tasaPromedioUsdt: promedio de tasaVentaUsdt
- promedioUsdtPorDia: si hay múltiples días, calcular promedio diario
```

### Mejoras en `components/RegistrosUSDT.js`:

- Cambiar labels a textos más descriptivos
- Añadir cards para estadísticas adicionales
- Mejorar agrupación visual de las estadísticas

## Estructura de Estadísticas Mejorada

```
📈 Estadísticas de [Mes] [Año]

Operaciones:
- Total consultas: X
- Días con registros: X

Montos (USDT):
- Total USDT: X USDT
- Promedio por consulta: X USDT
- Mínimo: X USDT
- Máximo: X USDT

Montos (Bolos):
- Total bolos: X bolos
- Promedio por consulta: X bolos

Tasas:
- Tasa promedio USDT: X bolos/USDT
```

## Pregunta para el Usuario

¿Qué representa el "Promedio USDT" para ti?

- ¿Es útil saber el promedio de USDT por consulta?
- ¿Prefieres ver otras estadísticas (min/max, promedio diario, etc.)?
- ¿El nombre actual es claro o prefieres algo más descriptivo?
