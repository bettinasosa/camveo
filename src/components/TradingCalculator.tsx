import { useState, useMemo } from "react"
import { PriceData } from "@/lib/types"
import {
  calculateBestTradingRoute,
  formatTradingRoute
} from "@/lib/trading-calculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TradingCalculatorProps {
  prices: PriceData[]
  tradeType: "BUY" | "SELL"
  loading: boolean
}

export function TradingCalculator({
  prices,
  tradeType,
  loading
}: TradingCalculatorProps) {
  const [targetAmount, setTargetAmount] = useState("200")
  const [showCalculator, setShowCalculator] = useState(false)

  const calculationResult = useMemo(() => {
    if (!showCalculator || loading || prices.length === 0) return null

    try {
      const amount = parseFloat(targetAmount)
      if (isNaN(amount) || amount <= 0) return null

      return calculateBestTradingRoute(prices, amount, 5)
    } catch (error) {
      console.error("Trading calculation error:", error)
      return null
    }
  }, [targetAmount, prices, showCalculator, loading])

  const handleCalculate = () => {
    setShowCalculator(true)
  }

  const handleReset = () => {
    setShowCalculator(false)
    setTargetAmount("200")
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Trading Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>💰 Trading Calculator</span>
          <Badge variant="outline">
            {tradeType} {targetAmount} USDT
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showCalculator ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">
                  Amount to {tradeType.toLowerCase()} (USDT)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  placeholder="200"
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCalculate} className="w-full">
                  Calculate Best Route
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Find the most cost-effective combination of offers for your trade
              amount.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Input Controls */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="amount-edit">Amount (USDT)</Label>
                <Input
                  id="amount-edit"
                  type="number"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  placeholder="200"
                  min="1"
                  step="0.01"
                />
              </div>
              <Button onClick={handleCalculate} variant="outline">
                Recalculate
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>

            {/* Results */}
            {calculationResult ? (
              <div className="space-y-4">
                {/* Best Route Summary */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-800">
                      🎯 Best Trading Route
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Total Cost</div>
                        <div className="text-lg font-bold text-green-700">
                          {
                            formatTradingRoute(calculationResult.bestRoute)
                              .totalCost
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Average Price
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          {
                            formatTradingRoute(calculationResult.bestRoute)
                              .averagePrice
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Savings</div>
                        <div className="text-lg font-bold text-green-700">
                          {
                            formatTradingRoute(calculationResult.bestRoute)
                              .savings
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Efficiency</div>
                        <div className="text-lg font-bold text-green-700">
                          {
                            formatTradingRoute(calculationResult.bestRoute)
                              .efficiency
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Route Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">
                      📋 Route Details (
                      {calculationResult.bestRoute.offers.length} offers)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {calculationResult.bestRoute.offers.map(
                        (offer, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">#{index + 1}</Badge>
                              <div>
                                <div className="font-medium">
                                  {offer.advertiser.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {offer.amount.toFixed(2)} USDT @{" "}
                                  {offer.price.toFixed(2)} VES
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {(offer.amount * offer.price).toFixed(2)} VES
                              </div>
                              <div className="text-sm text-gray-600">
                                {offer.advertiser.rating.toFixed(1)}% rating
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Alternative Routes */}
                {calculationResult.alternativeRoutes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">
                        🔄 Alternative Routes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {calculationResult.alternativeRoutes.map(
                          (route, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                  Route {index + 2}
                                </span>
                                <Badge variant="outline">
                                  {route.offers.length} offers
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Cost:</span>
                                  <div className="font-medium">
                                    {formatTradingRoute(route).totalCost}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Avg Price:
                                  </span>
                                  <div className="font-medium">
                                    {formatTradingRoute(route).averagePrice}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Efficiency:
                                  </span>
                                  <div className="font-medium">
                                    {formatTradingRoute(route).efficiency}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>
                  Unable to calculate trading route for {targetAmount} USDT.
                </p>
                <p className="text-sm mt-1">
                  Try a smaller amount or check available offers.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
