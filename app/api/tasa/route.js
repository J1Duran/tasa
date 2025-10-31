import { obtenerTipoCambio } from "@/lib/bcv";
import { NextResponse } from "next/server";

// Cache de las tasas (5 minutos)
const tasaCache = {
  USD: null,
  EUR: null,
};
const tasaCacheTimestamp = {
  USD: null,
  EUR: null,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * GET /api/tasa?moneda=USD|EUR
 * Obtiene el tipo de cambio del BCV con caché de 5 minutos
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const moneda = (searchParams.get("moneda") || "USD").toUpperCase();

    if (moneda !== "USD" && moneda !== "EUR") {
      return NextResponse.json(
        {
          success: false,
          error: "Moneda no soportada. Use USD o EUR",
        },
        { status: 400 }
      );
    }

    // Verificar si hay caché válido
    const now = Date.now();
    if (
      tasaCache[moneda] &&
      tasaCacheTimestamp[moneda] &&
      now - tasaCacheTimestamp[moneda] < CACHE_DURATION
    ) {
      return NextResponse.json({
        success: true,
        data: tasaCache[moneda],
        cached: true,
      });
    }

    // Obtener nueva tasa del BCV
    const datosTasa = await obtenerTipoCambio(moneda);

    // Actualizar caché
    tasaCache[moneda] = datosTasa;
    tasaCacheTimestamp[moneda] = now;

    return NextResponse.json({
      success: true,
      data: datosTasa,
      cached: false,
    });
  } catch (error) {
    console.error("Error al obtener tasa del BCV:", error);

    const moneda = (new URL(request.url).searchParams.get("moneda") || "USD").toUpperCase();

    // Si hay error pero tenemos caché, retornar el caché
    if (tasaCache[moneda]) {
      return NextResponse.json({
        success: true,
        data: tasaCache[moneda],
        cached: true,
        warning: "Usando tasa en caché debido a error al obtener nueva tasa",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al obtener la tasa",
      },
      { status: 500 }
    );
  }
}

