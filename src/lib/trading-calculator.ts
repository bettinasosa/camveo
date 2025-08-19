import { PriceData } from "./types"

export interface TradingRoute {
  offers: PriceData[]
  totalAmount: number
  totalCost: number
  averagePrice: number
  savings: number // compared to using the worst price
  efficiency: number // percentage of optimal price
}

export interface TradingCalculatorResult {
  targetAmount: number
  bestRoute: TradingRoute
  alternativeRoutes: TradingRoute[]
  summary: {
    totalOffers: number
    averagePrice: number
    totalCost: number
    savings: number
    efficiency: number
  }
}

/**
 * Calculates the best trading route for a specific amount
 * @param offers - Available price offers
 * @param targetAmount - Amount to trade (in USDT)
 * @param maxOffers - Maximum number of offers to combine (default: 5)
 * @returns Best trading route and alternatives
 */
export function calculateBestTradingRoute(
  offers: PriceData[],
  targetAmount: number,
  maxOffers: number = 5
): TradingCalculatorResult {
  if (offers.length === 0) {
    throw new Error("No offers available")
  }

  // Sort offers by price (best first for buying, worst first for selling)
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.tradeType === "BUY") {
      return a.price - b.price // Lowest price first for buying
    } else {
      return b.price - a.price // Highest price first for selling
    }
  })

  // Find all possible combinations of offers
  const combinations = findOfferCombinations(
    sortedOffers,
    targetAmount,
    maxOffers
  )

  if (combinations.length === 0) {
    throw new Error(`No combination found for ${targetAmount} USDT`)
  }

  // Sort combinations by efficiency (best first)
  combinations.sort((a, b) => b.efficiency - a.efficiency)

  const bestRoute = combinations[0]
  const alternativeRoutes = combinations.slice(1, 4) // Top 3 alternatives

  // Calculate summary statistics
  const worstPrice = sortedOffers[sortedOffers.length - 1].price
  const optimalPrice = sortedOffers[0].price
  const totalSavings = (worstPrice - bestRoute.averagePrice) * targetAmount

  return {
    targetAmount,
    bestRoute,
    alternativeRoutes,
    summary: {
      totalOffers: bestRoute.offers.length,
      averagePrice: bestRoute.averagePrice,
      totalCost: bestRoute.totalCost,
      savings: totalSavings,
      efficiency: bestRoute.efficiency
    }
  }
}

/**
 * Finds all possible combinations of offers that can fulfill the target amount
 */
function findOfferCombinations(
  offers: PriceData[],
  targetAmount: number,
  maxOffers: number
): TradingRoute[] {
  const combinations: TradingRoute[] = []

  // Try combinations of 1 to maxOffers offers
  for (let size = 1; size <= Math.min(maxOffers, offers.length); size++) {
    const combinationsOfSize = generateCombinations(offers, size)

    for (const combination of combinationsOfSize) {
      const route = calculateRouteFromOffers(combination, targetAmount)
      if (route) {
        combinations.push(route)
      }
    }
  }

  return combinations
}

/**
 * Generates all combinations of offers of a given size
 */
function generateCombinations(
  offers: PriceData[],
  size: number
): PriceData[][] {
  if (size === 1) {
    return offers.map(offer => [offer])
  }

  const combinations: PriceData[][] = []

  for (let i = 0; i <= offers.length - size; i++) {
    const firstOffer = offers[i]
    const remainingOffers = offers.slice(i + 1)
    const subCombinations = generateCombinations(remainingOffers, size - 1)

    for (const subCombination of subCombinations) {
      combinations.push([firstOffer, ...subCombination])
    }
  }

  return combinations
}

/**
 * Calculates a trading route from a combination of offers
 */
function calculateRouteFromOffers(
  offers: PriceData[],
  targetAmount: number
): TradingRoute | null {
  // Sort offers by price (best first)
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.tradeType === "BUY") {
      return a.price - b.price
    } else {
      return b.price - a.price
    }
  })

  let remainingAmount = targetAmount
  const usedOffers: PriceData[] = []
  let totalCost = 0

  // Use offers in order of best price
  for (const offer of sortedOffers) {
    if (remainingAmount <= 0) break

    const useAmount = Math.min(remainingAmount, offer.amount)
    const offerCost = useAmount * offer.price

    usedOffers.push({
      ...offer,
      amount: useAmount // Override with actual used amount
    })

    totalCost += offerCost
    remainingAmount -= useAmount
  }

  // If we couldn't fulfill the target amount, return null
  if (remainingAmount > 0) {
    return null
  }

  const averagePrice = totalCost / targetAmount
  const worstPrice = sortedOffers[sortedOffers.length - 1].price
  const optimalPrice = sortedOffers[0].price
  const savings = (worstPrice - averagePrice) * targetAmount
  const efficiency = (optimalPrice / averagePrice) * 100

  return {
    offers: usedOffers,
    totalAmount: targetAmount,
    totalCost,
    averagePrice,
    savings,
    efficiency
  }
}

/**
 * Formats a trading route for display
 */
export function formatTradingRoute(route: TradingRoute): {
  totalCost: string
  averagePrice: string
  savings: string
  efficiency: string
} {
  return {
    totalCost: new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2
    }).format(route.totalCost),
    averagePrice: new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2
    }).format(route.averagePrice),
    savings: new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2
    }).format(route.savings),
    efficiency: `${route.efficiency.toFixed(1)}%`
  }
}
