import { NextResponse } from "next/server";
import { verifyCredentials, generateToken } from "@/lib/auth";

/**
 * POST /api/admin/login
 * Authenticates admin user and returns JWT token
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required",
        },
        { status: 400 }
      );
    }

    // Verify credentials
    const isValid = await verifyCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(username);

    // Create response with token
    const response = NextResponse.json({
      success: true,
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error during authentication",
      },
      { status: 500 }
    );
  }
}

