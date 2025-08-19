import { PriceData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PriceCardProps {
  data: PriceData
  isBest?: boolean | null
}

/**
 * Displays a single P2P price offer in a card format
 */
export function PriceCard({ data, isBest = false }: PriceCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getTradeTypeColor = (type: "BUY" | "SELL") => {
    return type === "BUY"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg ${
        isBest ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {formatPrice(data.price)}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getTradeTypeColor(data.tradeType)}>
              {data.tradeType}
            </Badge>
            {isBest && (
              <Badge className="bg-blue-100 text-blue-800">Best</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Available:</span>
          <span className="font-medium">{formatAmount(data.amount)} USDT</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Trader:</span>
          <span className="font-medium">{data.advertiser.name}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Rating:</span>
          <span className="font-medium">
            {data.advertiser.rating.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Orders:</span>
          <span className="font-medium">{data.advertiser.orderCount}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Completion:</span>
          <span className="font-medium">
            {data.advertiser.completionRate.toFixed(1)}%
          </span>
        </div>

        {data.paymentMethods.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-500 mb-1">Payment Methods:</div>
            <div className="flex flex-wrap gap-1">
              {data.paymentMethods.slice(0, 3).map((method, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {method}
                </Badge>
              ))}
              {data.paymentMethods.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{data.paymentMethods.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
