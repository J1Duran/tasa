import { obtenerTipoCambio } from "@/lib/bcv";
import { getBinanceP2PRates } from "@/lib/binance";
import { NextResponse } from "next/server";

// Dynamic import for scraping monitor
async function recordScrapingAttempt(currency, success, error, data) {
  const { recordScrapingAttempt: recordFunc } = await import("@/lib/scraping-monitor");
  return recordFunc(currency, success, error, data);
}

// Rate cache (5 minutes)
const rateCache = {
  USD: null,
  EUR: null,
  USDT: null,
};
const rateCacheTimestamp = {
  USD: null,
  EUR: null,
  USDT: null,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * GET /api/tasa?moneda=USD|EUR|USDT
 * Gets the exchange rate (BCV for USD/EUR, Binance P2P for USDT) with 5 minute cache
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get("moneda") || "USD").toUpperCase();

    if (currency !== "USD" && currency !== "EUR" && currency !== "USDT") {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported currency. Use USD, EUR, or USDT",
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

    // Get new rate from BCV or Binance P2P
    let rateData;
    if (currency === "USDT") {
      try {
        rateData = await getBinanceP2PRates();
        // Record successful scraping
        await recordScrapingAttempt(currency, true, null, rateData);
      } catch (scrapingError) {
        // Record failed scraping
        await recordScrapingAttempt(currency, false, scrapingError.message, null);
        throw scrapingError;
      }
    } else {
      try {
        rateData = await obtenerTipoCambio(currency);
        // Record successful scraping
        await recordScrapingAttempt(currency, true, null, rateData);
      } catch (scrapingError) {
        // Record failed scraping
        await recordScrapingAttempt(currency, false, scrapingError.message, null);
        throw scrapingError;
      }
    }

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

