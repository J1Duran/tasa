import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

/**
 * Obtiene el tipo de cambio de una moneda del Banco Central de Venezuela (BCV)
 * @param {string} moneda - 'USD' o 'EUR'
 * @returns {Promise<{moneda: string, valor: string, tasa: number, fecha: string}>}
 */
export async function obtenerTipoCambio(moneda = "USD") {
  // Configurar agente HTTPS con opciones más permisivas para SSL
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Permite certificados autofirmados o problemáticos
  });

  // Realizar petición HTTP a la página del BCV
  const response = await axios.get("https://www.bcv.org.ve", {
    httpsAgent: httpsAgent,
    timeout: 30000, // 30 segundos de timeout
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    },
  });

  // Parsear el HTML con cheerio
  const $ = cheerio.load(response.data);

  // Mapear moneda a ID del elemento en el HTML
  const monedaMap = {
    USD: "dolar",
    EUR: "euro",
  };

  const elementoId = monedaMap[moneda.toUpperCase()];
  if (!elementoId) {
    throw new Error(`Moneda no soportada: ${moneda}`);
  }

  // Buscar el div con el ID correspondiente y extraer el valor del strong
  const monedaDiv = $(`#${elementoId}`);

  if (monedaDiv.length === 0) {
    throw new Error(`No se encontró el elemento #${elementoId} en la página`);
  }

  // Buscar el valor dentro del strong dentro del div
  const valorMoneda = monedaDiv.find("strong").first().text().trim();

  if (!valorMoneda) {
    throw new Error(
      `No se encontró el valor de ${moneda} en el elemento esperado`
    );
  }

  // Limpiar y formatear el valor (remover espacios extras)
  const valorLimpio = valorMoneda.replace(/\s+/g, "");

  // Convertir el valor a número (reemplazar coma por punto)
  const tasaNumerica = parseFloat(valorLimpio.replace(",", "."));

  if (isNaN(tasaNumerica)) {
    throw new Error(`No se pudo convertir la tasa a número: ${valorLimpio}`);
  }

  return {
    moneda: moneda.toUpperCase(),
    valor: valorLimpio,
    tasa: tasaNumerica,
    fecha: new Date().toISOString(),
  };
}

/**
 * Obtiene el tipo de cambio USD del Banco Central de Venezuela (BCV)
 * @returns {Promise<{moneda: string, valor: string, tasa: number, fecha: string}>}
 */
export async function obtenerTipoCambioUSD() {
  return obtenerTipoCambio("USD");
}

/**
 * Obtiene el tipo de cambio EUR del Banco Central de Venezuela (BCV)
 * @returns {Promise<{moneda: string, valor: string, tasa: number, fecha: string}>}
 */
export async function obtenerTipoCambioEUR() {
  return obtenerTipoCambio("EUR");
}

/**
 * Calcula la conversión de una moneda a Bolívares
 * @param {number[]} cantidades - Array de cantidades en la moneda seleccionada
 * @param {number} tasa - Tasa de cambio del BCV
 * @param {string} moneda - Moneda origen ('USD' o 'EUR')
 * @returns {{cantidades: number[], sumaMoneda: number, moneda: string, tasa: number, totalBolivares: number}}
 */
export function calcularConversion(cantidades, tasa, moneda = "USD") {
  // Validar que todas las cantidades sean números válidos
  const cantidadesValidas = cantidades
    .map((cantidad) => parseFloat(cantidad))
    .filter((cantidad) => !isNaN(cantidad) && cantidad >= 0);

  if (cantidadesValidas.length === 0) {
    throw new Error("No se ingresaron cantidades válidas");
  }

  // Calcular suma total
  const sumaMoneda = cantidadesValidas.reduce(
    (total, valor) => total + valor,
    0
  );

  // Calcular conversión a Bolívares
  const totalBolivares = sumaMoneda * tasa;

  return {
    cantidades: cantidadesValidas,
    sumaMoneda,
    moneda: moneda.toUpperCase(),
    tasa,
    totalBolivares,
  };
}
