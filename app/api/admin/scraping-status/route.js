import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getScrapingStatus } from "@/lib/scraping-monitor";

/**
 * GET /api/admin/scraping-status
 * Gets scraping status for all currencies (protected route)
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

    // Get scraping status
    const status = await getScrapingStatus();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error getting scraping status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error getting scraping status",
      },
      { status: 500 }
    );
  }
}

