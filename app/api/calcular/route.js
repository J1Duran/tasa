import { calcularConversion } from "@/lib/bcv";
import { NextResponse } from "next/server";

/**
 * POST /api/calcular
 * Calculates the conversion from a currency to Bolívares
 * Body: { cantidades: number[], tasa: number, moneda: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { cantidades, tasa, moneda = "USD" } = body;

    // Validate input
    if (!Array.isArray(cantidades) || cantidades.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Must provide an array of amounts",
        },
        { status: 400 }
      );
    }

    if (typeof tasa !== "number" || tasa <= 0 || isNaN(tasa)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate must be a positive number",
        },
        { status: 400 }
      );
    }

    // Calculate conversion
    const result = calcularConversion(cantidades, tasa, moneda);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error calculating conversion:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error calculating",
      },
      { status: 500 }
    );
  }
}

