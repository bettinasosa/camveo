import { useState, useEffect, useCallback } from "react"
import { PriceData, FilterOptions } from "@/lib/types"
import {
  fetchP2PPrices,
  fetchBuySellPrices,
  getBestPrices
} from "@/lib/binance-api"

interface UseP2PDataReturn {
  prices: PriceData[]
  buyPrices: PriceData[]
  sellPrices: PriceData[]
  bestBuy: PriceData | null
  bestSell: PriceData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  filterPrices: (options: FilterOptions) => PriceData[]
}

/**
 * Custom hook for managing Binance P2P data
 * @param asset - The cryptocurrency asset (default: 'USDT')
 * @param fiat - The fiat currency (default: 'VES')
 * @param autoRefresh - Whether to auto-refresh data (default: true)
 * @param refreshInterval - Refresh interval in milliseconds (default: 30000)
 */
export function useP2PData(
  asset: string = "USDT",
  fiat: string = "VES",
  autoRefresh: boolean = true,
  refreshInterval: number = 30000
): UseP2PDataReturn {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [buyPrices, setBuyPrices] = useState<PriceData[]>([])
  const [sellPrices, setSellPrices] = useState<PriceData[]>([])
  const [bestBuy, setBestBuy] = useState<PriceData | null>(null)
  const [bestSell, setBestSell] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch data with individual error handling
      let allPrices: PriceData[] = []
      let buySellData = { buy: [] as PriceData[], sell: [] as PriceData[] }
      let bestPrices = {
        bestBuy: null as PriceData | null,
        bestSell: null as PriceData | null
      }

      try {
        allPrices = await fetchP2PPrices(asset, fiat, "BUY", 20, 1)
      } catch (err) {
        console.warn("Failed to fetch all prices:", err)
      }

      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))

      try {
        buySellData = await fetchBuySellPrices(asset, fiat, 20)
      } catch (err) {
        console.warn("Failed to fetch buy/sell data:", err)
      }

      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))

      try {
        bestPrices = await getBestPrices(asset, fiat)
      } catch (err) {
        console.warn("Failed to fetch best prices:", err)
      }

      // Set whatever data we have
      setPrices(allPrices)
      setBuyPrices(buySellData.buy)
      setSellPrices(buySellData.sell)
      setBestBuy(bestPrices.bestBuy)
      setBestSell(bestPrices.bestSell)

      // Only show error if we have no data at all
      if (
        allPrices.length === 0 &&
        buySellData.buy.length === 0 &&
        buySellData.sell.length === 0
      ) {
        setError("Unable to fetch any P2P data. Please try again later.")
      } else {
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch P2P data")
      console.error("Error fetching P2P data:", err)
    } finally {
      setLoading(false)
    }
  }, [asset, fiat])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const filterPrices = useCallback(
    (options: FilterOptions): PriceData[] => {
      let filtered = prices.filter(
        price => price.tradeType === options.tradeType
      )

      if (options.paymentMethod) {
        filtered = filtered.filter(price =>
          price.paymentMethods.some(method =>
            (method.payBank || method.payType)
              .toLowerCase()
              .includes(options.paymentMethod!.toLowerCase())
          )
        )
      }

      if (options.bank) {
        filtered = filtered.filter(price =>
          price.paymentMethods.some(method =>
            (method.payBank || method.payType)
              .toLowerCase()
              .includes(options.bank!.toLowerCase())
          )
        )
      }

      if (options.minAmount) {
        filtered = filtered.filter(price => price.amount >= options.minAmount!)
      }

      if (options.maxAmount) {
        filtered = filtered.filter(price => price.amount <= options.maxAmount!)
      }

      return filtered.sort((a, b) => {
        if (options.tradeType === "BUY") {
          return a.price - b.price // Lowest price first for buying
        } else {
          return b.price - a.price // Highest price first for selling
        }
      })
    },
    [prices]
  )

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, autoRefresh, refreshInterval])

  return {
    prices,
    buyPrices,
    sellPrices,
    bestBuy,
    bestSell,
    loading,
    error,
    refresh,
    filterPrices
  }
}
