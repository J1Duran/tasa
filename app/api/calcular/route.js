import { calcularConversion } from "@/lib/bcv";
import { NextResponse } from "next/server";

/**
 * POST /api/calcular
 * Calcula la conversión de USD a Bolívares
 * Body: { cantidades: number[], tasa: number }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { cantidades, tasa } = body;

    // Validar entrada
    if (!Array.isArray(cantidades) || cantidades.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe proporcionar un array de cantidades",
        },
        { status: 400 }
      );
    }

    if (typeof tasa !== "number" || tasa <= 0 || isNaN(tasa)) {
      return NextResponse.json(
        {
          success: false,
          error: "La tasa debe ser un número positivo",
        },
        { status: 400 }
      );
    }

    // Calcular conversión
    const resultado = calcularConversion(cantidades, tasa);

    return NextResponse.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Error al calcular conversión:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido al calcular",
      },
      { status: 500 }
    );
  }
}

