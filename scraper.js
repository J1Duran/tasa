import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
import readline from "readline";

/**
 * Script para extraer el tipo de cambio USD del Banco Central de Venezuela (BCV)
 * y calcular conversiones de USD a Bolívares
 */

/**
 * Obtiene el tipo de cambio USD del BCV
 */
async function obtenerTipoCambioUSD() {
  try {
    console.log("Obteniendo datos del BCV...");

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
  } catch (error) {
    // Re-lanzar el error para que la función main lo maneje
    throw error;
  }
}

/**
 * Solicita al usuario que ingrese cantidades en USD
 */
function solicitarCantidades(rl, tasa) {
  rl.question(
    "\n💰 Ingresa las cantidades en USD (separadas por coma o espacio): ",
    (input) => {
      if (!input || input.trim() === "") {
        console.log("\n⚠️  No ingresaste ninguna cantidad. Intenta de nuevo.");
        solicitarCantidades(rl, tasa);
        return;
      }

      // Separar por coma o espacio y limpiar valores
      const cantidades = input
        .split(/[,\s]+/)
        .map((val) => val.trim())
        .filter((val) => val !== "")
        .map((val) => parseFloat(val.replace(",", ".")));

      // Validar que todos los valores sean números válidos
      const valoresInvalidos = cantidades.filter(
        (val) => isNaN(val) || val < 0
      );

      if (valoresInvalidos.length > 0) {
        console.log(
          "\n❌ Error: Algunos valores ingresados no son válidos. Solo se aceptan números positivos."
        );
        solicitarCantidades(rl, tasa);
        return;
      }

      // Calcular suma total
      const sumaUSD = cantidades.reduce((total, valor) => total + valor, 0);

      // Calcular conversión a Bolívares
      const totalBolivares = sumaUSD * tasa;

      // Mostrar resultados
      console.log("\n" + "=".repeat(50));
      console.log("📊 RESULTADO DEL CÁLCULO");
      console.log("=".repeat(50));
      console.log(`\n💵 Cantidades ingresadas:`);
      cantidades.forEach((cantidad, index) => {
        console.log(`   ${index + 1}. $${cantidad.toFixed(2)} USD`);
      });
      console.log(`\n📈 Suma total: $${sumaUSD.toFixed(2)} USD`);
      console.log(
        `\n💰 Tipo de cambio BCV: ${tasa.toLocaleString("es-VE")} Bs/USD`
      );
      console.log(
        `\n💵 Total en Bolívares: ${totalBolivares.toLocaleString("es-VE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} Bs`
      );
      console.log("\n" + "=".repeat(50));

      // Preguntar si desea hacer otro cálculo
      rl.question("\n¿Deseas realizar otro cálculo? (s/n): ", (respuesta) => {
        if (
          respuesta.toLowerCase() === "s" ||
          respuesta.toLowerCase() === "si"
        ) {
          solicitarCantidades(rl, tasa);
        } else {
          console.log("\n👋 ¡Hasta luego!");
          rl.close();
          process.exit(0);
        }
      });
    }
  );
}

/**
 * Función principal que coordina la obtención de la tasa y el cálculo
 */
async function main() {
  try {
    // Obtener la tasa del BCV
    const datosTasa = await obtenerTipoCambioUSD();

    console.log("\n✅ Tipo de cambio USD del BCV obtenido:");
    console.log(`   USD: ${datosTasa.valor} Bs\n`);

    // Crear interfaz readline
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Solicitar cantidades al usuario
    solicitarCantidades(rl, datosTasa.tasa);
  } catch (error) {
    if (error.response) {
      console.error(
        "❌ Error HTTP:",
        error.response.status,
        error.response.statusText
      );
      console.error("   URL:", error.config?.url);
    } else if (error.request) {
      console.error(
        "❌ Error de conexión: No se pudo conectar al servidor del BCV"
      );
      console.error("   Detalles:", error.message);
      console.error("   Code:", error.code);

      // Sugerencias según el código de error
      if (error.code === "ENOTFOUND") {
        console.error("\n💡 Sugerencia: Verifica tu conexión a internet");
      } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
        console.error(
          "\n💡 Sugerencia: El servidor tardó mucho en responder. Intenta de nuevo."
        );
      } else if (
        error.code === "CERT_HAS_EXPIRED" ||
        error.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
      ) {
        console.error(
          "\n💡 Sugerencia: Problema con el certificado SSL del sitio"
        );
      }
    } else {
      console.error("❌ Error:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar el script principal
main();
