import { getJSON, setJSON } from "./redis";

const STATUS_KEY = "scraping:status";

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
 * Reads scraping status from Redis
 * @returns {Promise<Object>} Scraping status
 */
export async function getScrapingStatus() {
  try {
    const status = await getJSON(STATUS_KEY);
    return status || DEFAULT_STATUS;
  } catch (error) {
    console.error("[Scraping Monitor] Error reading status from Redis:", error);
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

    await setJSON(STATUS_KEY, status);
  } catch (error) {
    console.error("Error recording scraping attempt:", error);
  }
}

