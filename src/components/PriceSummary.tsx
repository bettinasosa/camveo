import { PriceData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PriceSummaryProps {
  bestBuy: PriceData | null
  bestSell: PriceData | null
  loading: boolean
}

/**
 * Displays a summary of the best buy and sell prices
 */
export function PriceSummary({
  bestBuy,
  bestSell,
  loading
}: PriceSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const calculateSpread = () => {
    if (!bestBuy || !bestSell) return null
    const spread = bestSell.price - bestBuy.price
    const spreadPercentage = (spread / bestBuy.price) * 100
    return { spread, spreadPercentage }
  }

  const hasAnyData = bestBuy || bestSell

  const spread = calculateSpread()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Buy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Sell</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasAnyData) {
    return (
      <div className="mb-6">
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6 pb-6">
            <div className="text-center text-gray-500">
              <p>No price data available at the moment.</p>
              <p className="text-sm mt-1">
                This may be due to temporary API issues.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">BUY</Badge>
            Best Buy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestBuy ? (
            <div>
              <div className="text-2xl font-bold text-green-700 mb-1">
                {formatPrice(bestBuy.price)}
              </div>
              <div className="text-sm text-gray-600">
                by {bestBuy.advertiser.name}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No buy offers available</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">SELL</Badge>
            Best Sell
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestSell ? (
            <div>
              <div className="text-2xl font-bold text-red-700 mb-1">
                {formatPrice(bestSell.price)}
              </div>
              <div className="text-sm text-gray-600">
                by {bestSell.advertiser.name}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No sell offers available</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Spread</CardTitle>
        </CardHeader>
        <CardContent>
          {spread ? (
            <div>
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {formatPrice(spread.spread)}
              </div>
              <div className="text-sm text-gray-600">
                {spread.spreadPercentage.toFixed(2)}% difference
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Insufficient data</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
