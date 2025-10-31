import axios from "axios";

/**
 * Gets USDT to VES exchange rates from Binance P2P (buy and sell)
 * Filters offers for 100 USDT equivalent transactions
 * @returns {Promise<{moneda: string, tasaCompra: number, tasaVenta: number, tasa: number, valor: string, fecha: string, fuente: string}>}
 */
export async function getBinanceP2PRates() {
  const endpoint = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
  const minAmountUSDT = "100";
  const maxAmountUSDT = "1000";

  try {
    // Get SELL offers (sellers offering USDT) - this is the BUY price (what you pay to buy USDT, higher price)
    const buyResponse = await axios.post(endpoint, {
      asset: "USDT",
      fiat: "VES",
      tradeType: "SELL", // Sellers offering USDT - this is what you pay to buy USDT
      page: 1,
      rows: 20, // Get more offers to filter
      countries: [],
    });

    // Get BUY offers (buyers wanting USDT) - this is the SELL price (what you receive selling USDT, lower price)
    const sellResponse = await axios.post(endpoint, {
      asset: "USDT",
      fiat: "VES",
      tradeType: "BUY", // Buyers wanting USDT - this is what you receive selling USDT
      page: 1,
      rows: 20, // Get more offers to filter
      countries: [],
    });

    // Validate responses
    if (
      buyResponse.data?.code !== "000000" ||
      sellResponse.data?.code !== "000000"
    ) {
      throw new Error(
        `Binance API error: Buy=${buyResponse.data?.code}, Sell=${sellResponse.data?.code}`
      );
    }

    // Filter offers that accept 100 USDT transactions
    const filterOffers = (offers) => {
      if (!offers || !Array.isArray(offers)) return null;

      return offers.find((offer) => {
        const minAmount = parseFloat(offer.adv?.minSingleTransAmount || "0");
        const maxAmount = parseFloat(offer.adv?.maxSingleTransAmount || "999999");
        const amountUSDT = parseFloat(minAmountUSDT);

        return minAmount <= amountUSDT && maxAmount >= amountUSDT;
      });
    };

    // Find offers that accept 100 USDT
    const buyOffer = filterOffers(buyResponse.data?.data);
    const sellOffer = filterOffers(sellResponse.data?.data);

    // If no exact match, use the first offer as fallback
    const buyPrice = buyOffer
      ? parseFloat(buyOffer.adv.price)
      : parseFloat(buyResponse.data?.data?.[0]?.adv?.price || "0");

    const sellPrice = sellOffer
      ? parseFloat(sellOffer.adv.price)
      : parseFloat(sellResponse.data?.data?.[0]?.adv?.price || "0");

    if (buyPrice <= 0 || sellPrice <= 0) {
      throw new Error("Could not extract valid prices from Binance P2P");
    }

    // Calculate average rate
    const averageRate = (buyPrice + sellPrice) / 2;

    // Format value (remove decimals if whole number, otherwise 2 decimals)
    const formattedValue =
      averageRate % 1 === 0
        ? averageRate.toFixed(0)
        : averageRate.toFixed(2);

    return {
      moneda: "USDT",
      tasaCompra: buyPrice,
      tasaVenta: sellPrice,
      tasa: averageRate,
      valor: formattedValue,
      fecha: new Date().toISOString(),
      fuente: "Binance P2P",
    };
  } catch (error) {
    console.error("Error getting Binance P2P rates:", error);

    if (error.response) {
      throw new Error(
        `Binance API HTTP error: ${error.response.status} ${error.response.statusText}`
      );
    } else if (error.request) {
      throw new Error("Could not connect to Binance P2P API");
    } else {
      throw new Error(error.message || "Unknown error getting Binance rates");
    }
  }
}

