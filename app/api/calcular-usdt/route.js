import { NextResponse } from "next/server";
import { obtenerTipoCambio } from "@/lib/bcv";
import { getBinanceP2PRates } from "@/lib/binance";

/**
 * POST /api/calcular-usdt
 * Calculates how many USDT need to be sold to cover a price in Bs or USD/EUR
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { precioBolivares, precioMoneda, tipoMoneda } = body;

    // Validate that at least one input is provided
    if (!precioBolivares && !precioMoneda) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Debes proporcionar al menos un precio (en bolos o en USD/EUR)",
        },
        { status: 400 }
      );
    }

    // If both provided, prefer precioBolivares
    const useBolivares = !!precioBolivares;

    // Validate and parse inputs
    const precioBs = useBolivares
      ? parseFloat(precioBolivares)
      : precioMoneda
      ? parseFloat(precioMoneda)
      : 0;

    if (isNaN(precioBs) || precioBs <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El precio debe ser un número positivo válido",
        },
        { status: 400 }
      );
    }

    // Validate tipoMoneda if precioMoneda is provided
    if (!useBolivares && (!tipoMoneda || !["USD", "EUR"].includes(tipoMoneda))) {
      return NextResponse.json(
        {
          success: false,
          error: "El tipo de moneda debe ser USD o EUR",
        },
        { status: 400 }
      );
    }

    // Get required rates
    let precioFinalBolivares;
    let tasaBCV = null;
    let monedaOrigen;

    if (useBolivares) {
      // Direct Bolivares input
      precioFinalBolivares = precioBs;
      monedaOrigen = "Bs";
    } else {
      // Convert from USD/EUR to Bolivares using BCV rate
      const bcTasas = await obtenerTipoCambio(tipoMoneda);
      tasaBCV = parseFloat(bcTasas.tasa);
      precioFinalBolivares = precioBs * tasaBCV;
      monedaOrigen = tipoMoneda;
    }

    // Get USDT sell rate from Binance P2P
    const usdtRates = await getBinanceP2PRates();

    // Use sell rate (lower price, what you receive when selling USDT)
    const tasaVentaUsdt = usdtRates.tasaVenta;

    if (!tasaVentaUsdt || tasaVentaUsdt <= 0) {
      throw new Error("No se pudo obtener la tasa de venta de USDT");
    }

    // Calculate USDT needed: Bs / tasa venta USDT
    const usdtNecesarios = precioFinalBolivares / tasaVentaUsdt;

    // Format USDT result (2 decimals)
    const usdtFormateados = parseFloat(usdtNecesarios.toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        usdtNecesarios: usdtFormateados,
        precioBolivares: parseFloat(precioFinalBolivares.toFixed(2)),
        tasaVentaUsdt: tasaVentaUsdt,
        tasaBCV: tasaBCV,
        monedaOrigen: monedaOrigen,
        precioIngresado: parseFloat(precioBs.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error calculating USDT:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || "Error al calcular los USDT necesarios",
      },
      { status: 500 }
    );
  }
}
