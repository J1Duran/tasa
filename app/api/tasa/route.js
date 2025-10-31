import { obtenerTipoCambioUSD } from "@/lib/bcv";
import { NextResponse } from "next/server";

// Cache de la tasa (5 minutos)
let tasaCache = null;
let tasaCacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * GET /api/tasa
 * Obtiene el tipo de cambio USD del BCV con caché de 5 minutos
 */
export async function GET() {
  try {
    // Verificar si hay caché válido
    const now = Date.now();
    if (
      tasaCache &&
      tasaCacheTimestamp &&
      now - tasaCacheTimestamp < CACHE_DURATION
    ) {
      return NextResponse.json({
        success: true,
        data: tasaCache,
        cached: true,
      });
    }

    // Obtener nueva tasa del BCV
    const datosTasa = await obtenerTipoCambioUSD();

    // Actualizar caché
    tasaCache = datosTasa;
    tasaCacheTimestamp = now;

    return NextResponse.json({
      success: true,
      data: datosTasa,
      cached: false,
    });
  } catch (error) {
    console.error("Error al obtener tasa del BCV:", error);

    // Si hay error pero tenemos caché, retornar el caché
    if (tasaCache) {
      return NextResponse.json({
        success: true,
        data: tasaCache,
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

