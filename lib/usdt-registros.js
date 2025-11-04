/**
 * Gestión de registros de consultas USDT en localStorage
 */

const STORAGE_KEY = "usdt_registros";

/**
 * Genera un ID único para un registro
 */
function generarId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtiene todos los registros del localStorage
 * @returns {Array} Array de registros
 */
export function obtenerRegistros() {
  try {
    if (typeof window === "undefined") return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.registros || [];
  } catch (error) {
    console.error("Error obteniendo registros:", error);
    return [];
  }
}

/**
 * Guarda un nuevo registro
 * @param {Object} resultado - Resultado de la consulta USDT
 * @returns {boolean} true si se guardó correctamente
 */
export function guardarRegistro(resultado) {
  try {
    if (typeof window === "undefined") return false;
    
    const registros = obtenerRegistros();
    
    const nuevoRegistro = {
      id: generarId(),
      fecha: new Date().toISOString(),
      precioIngresado: resultado.precioIngresado || 0,
      monedaOrigen: resultado.monedaOrigen || "Bs",
      precioBolivares: resultado.precioBolivares || 0,
      tasaVentaUsdt: resultado.tasaVentaUsdt || 0,
      tasaBCV: resultado.tasaBCV || null,
      usdtNecesarios: resultado.usdtNecesarios || 0,
    };
    
    registros.push(nuevoRegistro);
    
    // Mantener solo los últimos 1000 registros para evitar llenar localStorage
    const registrosLimitados = registros.slice(-1000);
    
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ registros: registrosLimitados })
    );
    
    return true;
  } catch (error) {
    console.error("Error guardando registro:", error);
    // Si localStorage está lleno, intentar limpiar registros antiguos
    if (error.name === "QuotaExceededError") {
      try {
        const registros = obtenerRegistros();
        // Mantener solo los últimos 500
        const registrosLimitados = registros.slice(-500);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ registros: registrosLimitados })
        );
        // Reintentar guardar
        return guardarRegistro(resultado);
      } catch (retryError) {
        console.error("Error al limpiar y reintentar:", retryError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Elimina un registro por ID
 * @param {string} id - ID del registro a eliminar
 * @returns {boolean} true si se eliminó correctamente
 */
export function eliminarRegistro(id) {
  try {
    if (typeof window === "undefined") return false;
    
    const registros = obtenerRegistros();
    const registrosFiltrados = registros.filter((r) => r.id !== id);
    
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ registros: registrosFiltrados })
    );
    
    return true;
  } catch (error) {
    console.error("Error eliminando registro:", error);
    return false;
  }
}

/**
 * Elimina todos los registros de un mes específico
 * @param {number} mes - Mes (1-12)
 * @param {number} año - Año
 * @returns {number} Cantidad de registros eliminados
 */
export function eliminarRegistrosPorMes(mes, año) {
  try {
    if (typeof window === "undefined") return 0;
    
    const registros = obtenerRegistros();
    const registrosFiltrados = registros.filter((registro) => {
      const fecha = new Date(registro.fecha);
      return !(fecha.getMonth() + 1 === mes && fecha.getFullYear() === año);
    });
    
    const eliminados = registros.length - registrosFiltrados.length;
    
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ registros: registrosFiltrados })
    );
    
    return eliminados;
  } catch (error) {
    console.error("Error eliminando registros por mes:", error);
    return 0;
  }
}

/**
 * Obtiene registros filtrados por mes y año
 * @param {number} mes - Mes (1-12)
 * @param {number} año - Año
 * @returns {Array} Array de registros del mes
 */
export function obtenerRegistrosPorMes(mes, año) {
  const registros = obtenerRegistros();
  
  return registros.filter((registro) => {
    const fecha = new Date(registro.fecha);
    return fecha.getMonth() + 1 === mes && fecha.getFullYear() === año;
  });
}

/**
 * Obtiene estadísticas mensuales
 * @param {number} mes - Mes (1-12)
 * @param {number} año - Año
 * @returns {Object} Objeto con estadísticas
 */
export function obtenerEstadisticasMensuales(mes, año) {
  const registros = obtenerRegistrosPorMes(mes, año);
  
  if (registros.length === 0) {
    return {
      totalConsultas: 0,
      totalUsdt: 0,
      promedioUsdt: 0,
      usdtMinimo: 0,
      usdtMaximo: 0,
      totalBolivares: 0,
      promedioBolivares: 0,
      tasaPromedioUsdt: 0,
      diasConRegistros: 0,
    };
  }
  
  const totalUsdt = registros.reduce(
    (sum, r) => sum + (r.usdtNecesarios || 0),
    0
  );
  
  const totalBolivares = registros.reduce(
    (sum, r) => sum + (r.precioBolivares || 0),
    0
  );
  
  // Calcular mínimo y máximo USDT
  const usdtValues = registros
    .map((r) => r.usdtNecesarios || 0)
    .filter((v) => v > 0);
  
  const usdtMinimo = usdtValues.length > 0 ? Math.min(...usdtValues) : 0;
  const usdtMaximo = usdtValues.length > 0 ? Math.max(...usdtValues) : 0;
  
  // Calcular promedio de tasa de venta USDT
  const tasasUsdt = registros
    .map((r) => r.tasaVentaUsdt || 0)
    .filter((t) => t > 0);
  
  const tasaPromedioUsdt =
    tasasUsdt.length > 0
      ? tasasUsdt.reduce((sum, t) => sum + t, 0) / tasasUsdt.length
      : 0;
  
  // Calcular días únicos con registros
  const diasUnicos = new Set(
    registros.map((r) => {
      const fecha = new Date(r.fecha);
      return fecha.toDateString();
    })
  );
  
  return {
    totalConsultas: registros.length,
    totalUsdt: parseFloat(totalUsdt.toFixed(2)),
    promedioUsdt: parseFloat((totalUsdt / registros.length).toFixed(2)),
    usdtMinimo: parseFloat(usdtMinimo.toFixed(2)),
    usdtMaximo: parseFloat(usdtMaximo.toFixed(2)),
    totalBolivares: parseFloat(totalBolivares.toFixed(2)),
    promedioBolivares: parseFloat((totalBolivares / registros.length).toFixed(2)),
    tasaPromedioUsdt: parseFloat(tasaPromedioUsdt.toFixed(2)),
    diasConRegistros: diasUnicos.size,
  };
}

/**
 * Obtiene todos los meses/años únicos con registros
 * @returns {Array} Array de objetos {mes, año}
 */
export function obtenerMesesDisponibles() {
  const registros = obtenerRegistros();
  const mesesSet = new Set();
  
  registros.forEach((registro) => {
    const fecha = new Date(registro.fecha);
    mesesSet.add(`${fecha.getFullYear()}-${fecha.getMonth() + 1}`);
  });
  
  return Array.from(mesesSet)
    .map((mesStr) => {
      const [año, mes] = mesStr.split("-");
      return { mes: parseInt(mes), año: parseInt(año) };
    })
    .sort((a, b) => {
      if (a.año !== b.año) return b.año - a.año;
      return b.mes - a.mes;
    });
}

/**
 * Elimina todos los registros
 * @returns {boolean} true si se eliminaron correctamente
 */
export function eliminarTodosLosRegistros() {
  try {
    if (typeof window === "undefined") return false;
    
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error eliminando todos los registros:", error);
    return false;
  }
}

