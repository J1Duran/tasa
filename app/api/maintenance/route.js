import { NextResponse } from "next/server";
import { getMaintenanceStatus } from "@/lib/maintenance";

/**
 * GET /api/maintenance
 * Get current maintenance status (public endpoint)
 */
export async function GET(request) {
  try {
    const status = await getMaintenanceStatus();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error getting maintenance status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error getting maintenance status",
        data: {
          active: false,
          whatsappLink: "",
        },
      },
      { status: 500 }
    );
  }
}

