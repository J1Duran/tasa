import { obtenerTipoCambio } from "@/lib/bcv";
import { NextResponse } from "next/server";

// Rate cache (5 minutes)
const rateCache = {
  USD: null,
  EUR: null,
};
const rateCacheTimestamp = {
  USD: null,
  EUR: null,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * GET /api/tasa?moneda=USD|EUR
 * Gets the BCV exchange rate with 5 minute cache
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get("moneda") || "USD").toUpperCase();

    if (currency !== "USD" && currency !== "EUR") {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported currency. Use USD or EUR",
        },
        { status: 400 }
      );
    }

    // Check if valid cache exists
    const now = Date.now();
    if (
      rateCache[currency] &&
      rateCacheTimestamp[currency] &&
      now - rateCacheTimestamp[currency] < CACHE_DURATION
    ) {
      return NextResponse.json({
        success: true,
        data: rateCache[currency],
        cached: true,
      });
    }

    // Get new rate from BCV
    const rateData = await obtenerTipoCambio(currency);

    // Update cache
    rateCache[currency] = rateData;
    rateCacheTimestamp[currency] = now;

    return NextResponse.json({
      success: true,
      data: rateData,
      cached: false,
    });
  } catch (error) {
    console.error("Error getting BCV rate:", error);

    const currency = (new URL(request.url).searchParams.get("moneda") || "USD").toUpperCase();

    // If error but we have cache, return cache
    if (rateCache[currency]) {
      return NextResponse.json({
        success: true,
        data: rateCache[currency],
        cached: true,
        warning: "Using cached rate due to error fetching new rate",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error getting rate",
      },
      { status: 500 }
    );
  }
}

