import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

/**
 * Obtiene el tipo de cambio USD del Banco Central de Venezuela (BCV)
 * @returns {Promise<{moneda: string, valor: string, tasa: number, fecha: string}>}
 */
export async function obtenerTipoCambioUSD() {
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

  // Buscar el div con id="dolar" y extraer el valor del strong
  const dolarDiv = $("#dolar");

  if (dolarDiv.length === 0) {
    throw new Error("No se encontró el elemento #dolar en la página");
  }

  // Buscar el valor dentro del strong dentro del div
  const valorUSD = dolarDiv.find("strong").first().text().trim();

  if (!valorUSD) {
    throw new Error(
      "No se encontró el valor del dólar en el elemento esperado"
    );
  }

  // Limpiar y formatear el valor (remover espacios extras)
  const valorLimpio = valorUSD.replace(/\s+/g, "");

  // Convertir el valor a número (reemplazar coma por punto)
  const tasaNumerica = parseFloat(valorLimpio.replace(",", "."));

  if (isNaN(tasaNumerica)) {
    throw new Error(`No se pudo convertir la tasa a número: ${valorLimpio}`);
  }

  return {
    moneda: "USD",
    valor: valorLimpio,
    tasa: tasaNumerica,
    fecha: new Date().toISOString(),
  };
}

/**
 * Calcula la conversión de USD a Bolívares
 * @param {number[]} cantidades - Array de cantidades en USD
 * @param {number} tasa - Tasa de cambio del BCV
 * @returns {{cantidades: number[], sumaUSD: number, tasa: number, totalBolivares: number}}
 */
export function calcularConversion(cantidades, tasa) {
  // Validar que todas las cantidades sean números válidos
  const cantidadesValidas = cantidades
    .map((cantidad) => parseFloat(cantidad))
    .filter((cantidad) => !isNaN(cantidad) && cantidad >= 0);

  if (cantidadesValidas.length === 0) {
    throw new Error("No se ingresaron cantidades válidas");
  }

  // Calcular suma total
  const sumaUSD = cantidadesValidas.reduce((total, valor) => total + valor, 0);

  // Calcular conversión a Bolívares
  const totalBolivares = sumaUSD * tasa;

  return {
    cantidades: cantidadesValidas,
    sumaUSD,
    tasa,
    totalBolivares,
  };
}

