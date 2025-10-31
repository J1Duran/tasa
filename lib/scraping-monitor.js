import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STATUS_FILE = path.join(DATA_DIR, "scraping-status.json");

// Default status structure
const DEFAULT_STATUS = {
  USD: {
    active: false,
    lastSuccess: null,
    lastError: null,
    lastErrorTime: null,
    lastData: null,
  },
  EUR: {
    active: false,
    lastSuccess: null,
    lastError: null,
    lastErrorTime: null,
    lastData: null,
  },
  USDT: {
    active: false,
    lastSuccess: null,
    lastError: null,
    lastErrorTime: null,
    lastData: null,
  },
};

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
 * Reads scraping status from file
 * @returns {Promise<Object>} Scraping status
 */
export async function getScrapingStatus() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(STATUS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return default
    return DEFAULT_STATUS;
  }
}

/**
 * Records a scraping attempt
 * @param {string} currency - Currency (USD, EUR, USDT)
 * @param {boolean} success - Whether scraping was successful
 * @param {string|null} error - Error message if failed
 * @param {Object|null} data - Extracted data if successful
 */
export async function recordScrapingAttempt(currency, success, error = null, data = null) {
  try {
    await ensureDataDir();
    
    const status = await getScrapingStatus();
    const now = new Date().toISOString();

    if (!status[currency]) {
      status[currency] = { ...DEFAULT_STATUS.USD };
    }

    if (success) {
      status[currency].active = true;
      status[currency].lastSuccess = now;
      status[currency].lastError = null;
      status[currency].lastErrorTime = null;
      status[currency].lastData = data;
    } else {
      status[currency].lastError = error;
      status[currency].lastErrorTime = now;
      // Keep active status if there was a recent success (< 1 hour ago)
      if (status[currency].lastSuccess) {
        const lastSuccessTime = new Date(status[currency].lastSuccess);
        const hoursSinceSuccess = (Date.now() - lastSuccessTime.getTime()) / (1000 * 60 * 60);
        status[currency].active = hoursSinceSuccess < 1;
      } else {
        status[currency].active = false;
      }
    }

    await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2), "utf-8");
  } catch (error) {
    console.error("Error recording scraping attempt:", error);
  }
}

