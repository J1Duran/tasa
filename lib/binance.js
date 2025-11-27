import axios from "axios";
import { obtenerTipoCambio } from "./bcv";

/**
 * Gets USDT to VES exchange rates from Binance P2P (buy and sell)
 * Filters offers for 100 USDT equivalent transactions
 * @returns {Promise<{moneda: string, tasaCompra: number, tasaVenta: number, tasa: number, valor: string, fecha: string, fuente: string}>}
 */
export async function getBinanceP2PRates() {
  const endpoint =
    "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
  const minAmountUSDT = "100";
  const maxAmountUSDT = "1000";
  const percentage = 0.35;
  try {
    // Get BCV rate to calculate transAmount (100 USDT in bolivares)
    const bcvRate = await obtenerTipoCambio("USD");
    const transAmount = Math.round(parseFloat(bcvRate.tasa) * 100);

    // Get SELL offers (sellers offering USDT) - this is the BUY price (what you pay to buy USDT, higher price)
    const buyResponse = await axios.post(endpoint, {
      fiat: "VES",
      page: 1,
      rows: 10,
      tradeType: "BUY",
      asset: "USDT",
      countries: [],
      proMerchantAds: false,
      shieldMerchantAds: false,
      filterType: "tradable",
      periods: [],
      additionalKycVerifyFilter: 0,
      publisherType: "merchant",
      payTypes: ["PagoMovil", "Banesco"],
      classifies: ["mass", "profession", "fiat_trade"],
      tradedWith: false,
      followed: false,
      transAmount: transAmount * percentage + transAmount,
    });

    // Get BUY offers (buyers wanting USDT) - this is the SELL price (what you receive selling USDT, lower price)
    const sellResponse = await axios.post(endpoint, {
      fiat: "VES",
      page: 1,
      rows: 10,
      tradeType: "SELL",
      asset: "USDT",
      countries: [],
      proMerchantAds: false,
      shieldMerchantAds: false,
      filterType: "tradable",
      periods: [],
      additionalKycVerifyFilter: 0,
      publisherType: "merchant",
      payTypes: ["PagoMovil", "Banesco"],
      classifies: ["mass", "profession", "fiat_trade"],
      tradedWith: false,
      followed: false,
      transAmount: transAmount * percentage + transAmount,
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

    // For sell price: find the HIGHEST price from ALL offers (best offer when selling USDT)
    // We don't filter by amount because offers have high minimums (10000+ USDT)
    // We just want the best price available
    let sellPrice = 0;
    if (
      sellResponse.data?.data &&
      Array.isArray(sellResponse.data.data) &&
      sellResponse.data.data.length > 0
    ) {
      const allSellOffers = sellResponse.data.data;
      const highestOffer = allSellOffers.reduce((max, offer) => {
        const currentPrice = parseFloat(offer.adv?.price || "0");
        const maxPrice = parseFloat(max.adv?.price || "0");
        return currentPrice > maxPrice ? offer : max;
      }, allSellOffers[0]);

      sellPrice = parseFloat(highestOffer.adv.price);
    }

    // For buy price: find the HIGHEST price from ALL offers (best offer when buying USDT)
    let buyPrice = 0;
    if (
      buyResponse.data?.data &&
      Array.isArray(buyResponse.data.data) &&
      buyResponse.data.data.length > 0
    ) {
      const allBuyOffers = buyResponse.data.data;
      const highestOffer = allBuyOffers.reduce((max, offer) => {
        const currentPrice = parseFloat(offer.adv?.price || "0");
        const maxPrice = parseFloat(max.adv?.price || "0");
        return currentPrice > maxPrice ? offer : max;
      }, allBuyOffers[0]);

      buyPrice = parseFloat(highestOffer.adv.price);
    }
    // console.log(
    //   "🚀 ~ getBinanceP2PRates ~ sellResponse.data?.data?:",
    //   sellResponse.data?.data
    // );

    if (buyPrice <= 0 || sellPrice <= 0) {
      throw new Error("Could not extract valid prices from Binance P2P");
    }

    // Calculate average rate
    const averageRate = (buyPrice + sellPrice) / 2;

    // Format value (remove decimals if whole number, otherwise 2 decimals)
    const formattedValue =
      averageRate % 1 === 0 ? averageRate.toFixed(0) : averageRate.toFixed(2);

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
