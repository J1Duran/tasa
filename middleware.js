import { NextResponse } from "next/server";
import { getMaintenanceStatus } from "./lib/maintenance";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow access to admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Allow access to maintenance page itself
  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  // Allow access to API maintenance endpoint (for checking status)
  if (pathname === "/api/maintenance") {
    return NextResponse.next();
  }

  // Check maintenance status
  try {
    const maintenanceStatus = await getMaintenanceStatus();
    
    if (maintenanceStatus.active) {
      // Redirect to maintenance page
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Error checking maintenance status in middleware:", error);
    // If there's an error, allow the request to proceed
    // This prevents the site from being inaccessible due to Redis issues
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

