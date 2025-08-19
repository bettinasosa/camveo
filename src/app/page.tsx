"use client"

import { useState } from "react"
import { useP2PData } from "@/hooks/useP2PData"
import { PriceSummary } from "@/components/PriceSummary"
import { PriceList } from "@/components/PriceList"
import { PriceCard } from "@/components/PriceCard"
import { TradingCalculator } from "@/components/TradingCalculator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const [viewMode, setViewMode] = useState<"summary" | "cards" | "table">(
    "summary"
  )
  const [selectedTradeType, setSelectedTradeType] = useState<"BUY" | "SELL">(
    "BUY"
  )

  const { buyPrices, sellPrices, bestBuy, bestSell, loading, error, refresh } =
    useP2PData("USDT", "VES", true, 30000) // Auto-refresh every 30 seconds

  const currentPrices = selectedTradeType === "BUY" ? buyPrices : sellPrices

  const handleRefresh = async () => {
    await refresh()
  }

  // Show error banner if there's an error but still display content if we have data
  const showErrorBanner =
    error && buyPrices.length === 0 && sellPrices.length === 0

  if (showErrorBanner) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">
                  Error Loading Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              USDT/VES P2P Market
            </h1>
            <p className="text-gray-600 mb-6">
              Real-time Binance P2P prices for USDT vs Venezuelan Bolivares
            </p>

            {/* Warning Banner */}
            {error && (buyPrices.length > 0 || sellPrices.length > 0) && (
              <div className="mb-6">
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-800 text-sm">
                          ⚠️ Some data may be incomplete due to API issues.
                          Showing available data.
                        </span>
                      </div>
                      <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                      >
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Trade Type:
                </span>
                <div className="flex rounded-lg border">
                  <Button
                    variant={selectedTradeType === "BUY" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTradeType("BUY")}
                    className="rounded-r-none"
                  >
                    <Badge className="bg-green-100 text-green-800 mr-1">
                      BUY
                    </Badge>
                    Buy USDT
                    {buyPrices.length > 0 && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        {buyPrices.length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={selectedTradeType === "SELL" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTradeType("SELL")}
                    className="rounded-l-none"
                  >
                    <Badge className="bg-red-100 text-red-800 mr-1">SELL</Badge>
                    Sell USDT
                    {sellPrices.length > 0 && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        {sellPrices.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex rounded-lg border">
                  <Button
                    variant={viewMode === "summary" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("summary")}
                    className="rounded-r-none"
                  >
                    Summary
                  </Button>
                  <Button
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("cards")}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="rounded-l-none"
                  >
                    Table
                  </Button>
                </div>
              </div>

              <Button onClick={handleRefresh} variant="outline" size="sm">
                Refresh
              </Button>

              <Button
                onClick={() => setViewMode("summary")}
                variant="outline"
                size="sm"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                💰 Calculator
              </Button>

              {/* Data Status */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Data:</span>
                {loading ? (
                  <span className="text-blue-600">Loading...</span>
                ) : buyPrices.length > 0 || sellPrices.length > 0 ? (
                  <span className="text-green-600">
                    {buyPrices.length + sellPrices.length} offers available
                  </span>
                ) : (
                  <span className="text-red-600">No data</span>
                )}
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {viewMode === "summary" && (
            <>
              <PriceSummary
                bestBuy={bestBuy}
                bestSell={bestSell}
                loading={loading}
              />

              {/* Trading Calculator */}
              <TradingCalculator
                prices={currentPrices}
                tradeType={selectedTradeType}
                loading={loading}
              />
            </>
          )}

          {/* Price Cards View */}
          {viewMode === "cards" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedTradeType} USDT Offers
                </h2>
                <span className="text-sm text-gray-600">
                  {currentPrices.length} offers available
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPrices.slice(0, 12).map((price, index) => (
                    <PriceCard
                      key={index}
                      data={price}
                      isBest={
                        (selectedTradeType === "BUY" &&
                          bestBuy &&
                          price.price === bestBuy.price) ||
                        (selectedTradeType === "SELL" &&
                          bestSell &&
                          price.price === bestSell.price)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Table View */}
          {viewMode === "table" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedTradeType} USDT Offers
                </h2>
              </div>

              <PriceList
                prices={currentPrices}
                loading={loading}
                tradeType={selectedTradeType}
              />
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>Data provided by Binance P2P API • Updates every 30 seconds</p>
            <p className="mt-1">
              This is for informational purposes only. Always verify prices
              before trading.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
