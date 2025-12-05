import { NextResponse } from "next/server";
import { getMaintenanceStatus, setMaintenanceStatus } from "@/lib/maintenance";
import jwt from "jsonwebtoken";

/**
 * GET /api/admin/maintenance
 * Get current maintenance status
 */
export async function GET(request) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

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
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/maintenance
 * Update maintenance status
 * Body: { active: boolean, whatsappLink?: string }
 */
export async function POST(request) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { active, whatsappLink } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "active must be a boolean",
        },
        { status: 400 }
      );
    }

    await setMaintenanceStatus(active, whatsappLink);

    return NextResponse.json({
      success: true,
      message: `Maintenance ${active ? "activated" : "deactivated"}`,
      data: await getMaintenanceStatus(),
    });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error updating maintenance status",
      },
      { status: 500 }
    );
  }
}

