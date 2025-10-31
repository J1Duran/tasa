import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/visits";

/**
 * POST /api/visits
 * Records a visit (alternative to middleware, useful for client-side tracking)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const path = body.path || "/";

    await recordVisit(request, path);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error recording visit:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error recording visit",
      },
      { status: 500 }
    );
  }
}

