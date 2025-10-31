"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Client-side visit tracker component
 * Records visits when pages load
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip tracking for admin routes
    if (pathname?.startsWith("/admin")) {
      return;
    }

    // Record visit
    const recordVisit = async () => {
      try {
        await fetch("/api/visits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname || "/",
          }),
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error("Error recording visit:", error);
      }
    };

    recordVisit();
  }, [pathname]);

  return null; // This component doesn't render anything
}

