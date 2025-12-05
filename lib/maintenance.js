import { getJSON, setJSON } from "./redis";

const MAINTENANCE_KEY = "maintenance:status";

/**
 * Gets the current maintenance status
 * @returns {Promise<{active: boolean, whatsappLink: string}>}
 */
export async function getMaintenanceStatus() {
  try {
    const status = await getJSON(MAINTENANCE_KEY);
    if (!status) {
      // Default: maintenance is disabled
      // Get WhatsApp link from environment variable
      // Format should be: https://wa.me/[NUMBER] or https://wa.me/[NUMBER]?text=...
      const whatsappLink = process.env.WHATSAPP_LINK || process.env.NEXT_PUBLIC_WHATSAPP_LINK || "";
      return {
        active: false,
        whatsappLink,
      };
    }
    // Ensure whatsappLink is set from env if not in Redis
    if (!status.whatsappLink) {
      status.whatsappLink = process.env.WHATSAPP_LINK || process.env.NEXT_PUBLIC_WHATSAPP_LINK || "";
    }
    return status;
  } catch (error) {
    console.error("Error getting maintenance status:", error);
    const whatsappLink = process.env.WHATSAPP_LINK || process.env.NEXT_PUBLIC_WHATSAPP_LINK || "";
    return {
      active: false,
      whatsappLink,
    };
  }
}

/**
 * Sets the maintenance status
 * @param {boolean} active - Whether maintenance is active
 * @param {string} whatsappLink - WhatsApp link (optional)
 * @returns {Promise<void>}
 */
export async function setMaintenanceStatus(active, whatsappLink = null) {
  try {
    const currentStatus = await getMaintenanceStatus();
    const status = {
      active,
      whatsappLink: whatsappLink || currentStatus.whatsappLink || process.env.WHATSAPP_LINK || process.env.NEXT_PUBLIC_WHATSAPP_LINK || "",
    };
    await setJSON(MAINTENANCE_KEY, status);
    console.log(`Maintenance status updated: active=${active}`);
  } catch (error) {
    console.error("Error setting maintenance status:", error);
    throw error;
  }
}

