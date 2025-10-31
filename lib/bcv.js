import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

/**
 * Gets the exchange rate of a currency from the Central Bank of Venezuela (BCV)
 * @param {string} currency - 'USD' or 'EUR'
 * @returns {Promise<{moneda: string, valor: string, tasa: number, fecha: string}>}
 */
export async function obtenerTipoCambio(currency = "USD") {
  // Configure HTTPS agent with more permissive SSL options
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Allows self-signed or problematic certificates
  });

  // Make HTTP request to BCV page
  const response = await axios.get("https://www.bcv.org.ve", {
    httpsAgent: httpsAgent,
    timeout: 30000, // 30 seconds timeout
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

  // Parse HTML with cheerio
  const $ = cheerio.load(response.data);

  // Map currency to HTML element ID
  const currencyMap = {
    USD: "dolar",
    EUR: "euro",
  };

  const elementId = currencyMap[currency.toUpperCase()];
  if (!elementId) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  // Find the div with the corresponding ID and extract the value from strong tag
  const currencyDiv = $(`#${elementId}`);

  if (currencyDiv.length === 0) {
    throw new Error(`Element #${elementId} not found on the page`);
  }

  // Find the value inside the strong tag within the div
  const currencyValue = currencyDiv.find("strong").first().text().trim();

  if (!currencyValue) {
    throw new Error(`Currency ${currency} value not found in expected element`);
  }

  // Clean and format the value (remove extra spaces)
  const cleanValue = currencyValue.replace(/\s+/g, "");

  // Convert value to number (replace comma with dot)
  const numericRate = parseFloat(cleanValue.replace(",", "."));

  if (isNaN(numericRate)) {
    throw new Error(`Could not convert rate to number: ${cleanValue}`);
  }

  return {
    moneda: currency.toUpperCase(),
    valor: cleanValue,
    tasa: numericRate,
    fecha: new Date().toISOString(),
  };
}

/**
 * Gets the USD exchange rate from the Central Bank of Venezuela (BCV)
 * @returns {Promise<{moneda: string, valor: string, tasa: number, fecha: string}>}
 */
export async function obtenerTipoCambioUSD() {
  return obtenerTipoCambio("USD");
}

/**
 * Gets the EUR exchange rate from the Central Bank of Venezuela (BCV)
 * @returns {Promise<{moneda: string, valor: string, tasa: number, fecha: string}>}
 */
export async function obtenerTipoCambioEUR() {
  return obtenerTipoCambio("EUR");
}

/**
 * Calculates the conversion from a currency to Bolívares
 * @param {number[]} amounts - Array of amounts in the selected currency
 * @param {number} rate - BCV exchange rate
 * @param {string} currency - Source currency ('USD' or 'EUR')
 * @returns {{cantidades: number[], sumaMoneda: number, moneda: string, tasa: number, totalBolivares: number}}
 */
export function calcularConversion(amounts, rate, currency = "USD") {
  // Validate that all amounts are valid numbers
  const validAmounts = amounts
    .map((amount) => parseFloat(amount))
    .filter((amount) => !isNaN(amount) && amount >= 0);

  if (validAmounts.length === 0) {
    throw new Error("No valid amounts provided");
  }

  // Calculate total sum
  const currencySum = validAmounts.reduce((total, value) => total + value, 0);

  // Calculate conversion to Bolívares
  const totalBolivares = currencySum * rate;

  return {
    cantidades: validAmounts,
    sumaMoneda: currencySum,
    moneda: currency.toUpperCase(),
    tasa: rate,
    totalBolivares,
  };
}
