import fs from "fs/promises";
import path from "path";
import { UAParser } from "ua-parser-js";

const DATA_DIR = path.join(process.cwd(), "data");
const VISITS_FILE = path.join(DATA_DIR, "visits.json");
const MAX_VISITS = 10000; // Maximum visits to keep

/**
 * Ensures data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Parses user agent string to extract browser, device, and OS info
 * @param {string} userAgent - User agent string
 * @returns {Object} Parsed user agent info
 */
function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: {
      name: result.browser.name || "Unknown",
      version: result.browser.version || "Unknown",
    },
    device: {
      type: result.device.type || "desktop",
      vendor: result.device.vendor || null,
      model: result.device.model || null,
    },
    os: {
      name: result.os.name || "Unknown",
      version: result.os.version || "Unknown",
    },
    engine: {
      name: result.engine.name || "Unknown",
      version: result.engine.version || "Unknown",
    },
  };
}

/**
 * Gets client IP from request
 * @param {Request} request - Next.js request object
 * @returns {string} Client IP address
 */
function getClientIP(request) {
  // Check for forwarded IP (Vercel, proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Check for real IP
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback
  return request.headers.get("x-vercel-forwarded-for") || "unknown";
}

/**
 * Reads visits from file
 * @returns {Promise<Array>} Array of visits
 */
export async function readVisits() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(VISITS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty array
    return [];
  }
}

/**
 * Writes visits to file
 * @param {Array} visits - Array of visits
 */
async function writeVisits(visits) {
  try {
    await ensureDataDir();
    await fs.writeFile(VISITS_FILE, JSON.stringify(visits, null, 2), "utf-8");
    console.log(`[Visits] Written ${visits.length} visits to file`);
  } catch (error) {
    console.error("[Visits] Error writing visits file:", error);
    throw error;
  }
}

/**
 * Records a visit
 * @param {Request} request - Next.js request object
 * @param {string} path - Request path
 */
export async function recordVisit(request, path = "/") {
  try {
    console.log(`[Visits] 📝 Starting to record visit for path: ${path}`);
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const referer = request.headers.get("referer") || null;

    console.log(
      `[Visits] IP: ${ip}, UserAgent: ${userAgent?.substring(0, 50)}...`
    );

    // Parse user agent
    const parsedUA = parseUserAgent(userAgent);

    // Create visit record
    const visit = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      referer,
      path,
      ...parsedUA,
    };

    console.log(`[Visits] Created visit record:`, {
      path: visit.path,
      ip: visit.ip,
      browser: visit.browser?.name,
      device: visit.device?.type,
    });

    // Read existing visits
    let visits = await readVisits();
    console.log(`[Visits] Read ${visits.length} existing visits from file`);

    // Add new visit
    visits.push(visit);

    // Rotate if exceeds max
    if (visits.length > MAX_VISITS) {
      // Keep only the most recent MAX_VISITS
      visits = visits.slice(-MAX_VISITS);
      console.log(
        `[Visits] Rotated to keep only ${MAX_VISITS} most recent visits`
      );
    }

    // Write back to file
    await writeVisits(visits);

    console.log(
      `[Visits] ✅ Successfully recorded visit: ${path} from ${ip} at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error("[Visits] ❌ Error recording visit:", error);
    console.error("[Visits] Error message:", error.message);
    console.error("[Visits] Error stack:", error.stack);
    throw error; // Re-throw to see in middleware catch
  }
}

/**
 * Gets visit statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getStats() {
  try {
    const visits = await readVisits();
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Filter today's visits
    const visitsToday = visits.filter((visit) => {
      const visitDate = new Date(visit.timestamp);
      return visitDate >= startOfDay;
    });

    // Get recent visits (last 50)
    const recentVisits = visits.slice(-50).reverse();

    return {
      total: visits.length,
      today: visitsToday.length,
      recent: recentVisits,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      total: 0,
      today: 0,
      recent: [],
    };
  }
}
