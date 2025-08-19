import axios from "axios"
import { PriceData } from "./types"

const API_BASE = "/api/p2p"

/**
 * Retry function for API calls
 */
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      console.log(
        `Request failed, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries exceeded")
}

/**
 * Fetches P2P advertisements from Binance
 * @param asset - The cryptocurrency asset (e.g., 'USDT')
 * @param fiat - The fiat currency (e.g., 'VES' for Venezuelan Bolivar)
 * @param tradeType - The trade type ('BUY' or 'SELL')
 * @param rows - Number of results to return (default: 20)
 * @param page - Page number (default: 1)
 * @returns Promise<PriceData[]> - Array of processed price data
 */
export async function fetchP2PPrices(
  asset: string = "USDT",
  fiat: string = "VES",
  tradeType: "BUY" | "SELL" = "BUY",
  rows: number = 20,
  page: number = 1
): Promise<PriceData[]> {
  return retryRequest(async () => {
    try {
      console.log("Fetching P2P prices:", {
        asset,
        fiat,
        tradeType,
        rows,
        page
      })

      // For BUY requests, we need to look for SELL offers (people selling USDT)
      // For SELL requests, we need to look for BUY offers (people buying USDT)
      const binanceTradeType = tradeType === "BUY" ? "SELL" : "BUY"

      const response = await axios.post(
        API_BASE,
        {
          page,
          rows,
          payTypes: [],
          asset,
          tradeType: binanceTradeType,
          fiat,
          publisherType: null
        },
        {
          timeout: 15000 // 15 second timeout
        }
      )

      console.log("API response received:", {
        success: response.data.success,
        total: response.data.total,
        dataLength: response.data.data?.length || 0
      })

      if (!response.data.success) {
        throw new Error(
          `Binance API error: ${response.data.message || "Unknown error"}`
        )
      }

      // Transform the data into our PriceData format
      return response.data.data.map(
        (ad: {
          adv: {
            price: string
            surplusAmount: string
            tradeType: string
            tradeMethods: { payType: string }[]
          }
          advertiser: {
            nickName?: string
            realName?: string
            positiveRate: string
            orderCount: string
            monthFinishRate: string
          }
        }) => ({
          price: parseFloat(ad.adv.price),
          amount: parseFloat(ad.adv.surplusAmount),
          paymentMethods: ad.adv.tradeMethods.map(
            (method: {
              payType: string
              payBank?: string
              paySubBank?: string
              payAccount?: string
            }) => ({
              payType: method.payType,
              payBank: method.payBank,
              paySubBank: method.paySubBank,
              payAccount: method.payAccount
            })
          ),
          advertiser: {
            name:
              ad.advertiser.nickName || ad.advertiser.realName || "Anonymous",
            rating: parseFloat(ad.advertiser.positiveRate) * 100,
            orderCount: parseInt(ad.advertiser.orderCount),
            completionRate: parseFloat(ad.advertiser.monthFinishRate) * 100
          },
          tradeType: ad.adv.tradeType as "BUY" | "SELL"
        })
      )
    } catch (error) {
      console.error("Error in fetchP2PPrices:", error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          throw new Error(
            `Server error: ${error.response.data?.error || error.message}`
          )
        }
        if (error.response?.status === 400) {
          throw new Error(
            `Bad request: ${error.response.data?.error || error.message}`
          )
        }
        if (error.code === "ECONNABORTED") {
          throw new Error("Request timeout - please try again")
        }
        throw new Error(`Network error: ${error.message}`)
      }
      if (error instanceof Error) {
        throw new Error(`API error: ${error.message}`)
      }
      throw new Error("Unknown error occurred while fetching P2P prices")
    }
  })
}

/**
 * Fetches both buy and sell prices for comparison
 * @param asset - The cryptocurrency asset (e.g., 'USDT')
 * @param fiat - The fiat currency (e.g., 'VES')
 * @param rows - Number of results per type (default: 10)
 * @returns Promise<{ buy: PriceData[], sell: PriceData[] }>
 */
export async function fetchBuySellPrices(
  asset: string = "USDT",
  fiat: string = "VES",
  rows: number = 10
): Promise<{ buy: PriceData[]; sell: PriceData[] }> {
  return retryRequest(async () => {
    try {
      const [buyPrices, sellPrices] = await Promise.all([
        fetchP2PPrices(asset, fiat, "BUY", rows, 1),
        fetchP2PPrices(asset, fiat, "SELL", rows, 1)
      ])

      return {
        buy: buyPrices,
        sell: sellPrices
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch buy/sell prices: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    }
  })
}

/**
 * Gets the best prices (lowest for buy, highest for sell)
 * @param asset - The cryptocurrency asset
 * @param fiat - The fiat currency
 * @returns Promise<{ bestBuy: PriceData | null, bestSell: PriceData | null }>
 */
export async function getBestPrices(
  asset: string = "USDT",
  fiat: string = "VES"
): Promise<{ bestBuy: PriceData | null; bestSell: PriceData | null }> {
  return retryRequest(async () => {
    try {
      const { buy, sell } = await fetchBuySellPrices(asset, fiat, 15)

      const bestBuy =
        buy.length > 0
          ? buy.reduce((best, current) =>
              current.price < best.price ? current : best
            )
          : null

      const bestSell =
        sell.length > 0
          ? sell.reduce((best, current) =>
              current.price > best.price ? current : best
            )
          : null

      return { bestBuy, bestSell }
    } catch (error) {
      throw new Error(
        `Failed to get best prices: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    }
  })
}
