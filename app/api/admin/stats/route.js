import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getStats } from "@/lib/visits";

/**
 * GET /api/admin/stats
 * Gets visit statistics (protected route)
 */
export async function GET(request) {
  try {
    // Verify authentication
    const decoded = verifyAuth(request);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Get statistics
    const stats = await getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error getting statistics",
      },
      { status: 500 }
    );
  }
}

