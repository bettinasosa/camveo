import { PriceData } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface PriceListProps {
  prices: PriceData[]
  loading: boolean
  tradeType: "BUY" | "SELL"
}

/**
 * Displays a list of P2P prices in a table format
 */
export function PriceList({ prices, loading, tradeType }: PriceListProps) {
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Trader</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Payment Methods</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (prices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No {tradeType.toLowerCase()} offers available at the moment.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge className={getTradeTypeColor(tradeType)}>{tradeType}</Badge>
        <span className="text-sm text-gray-600">
          {prices.length} offers available
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Price</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Trader</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead>Payment Methods</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((price, index) => (
            <TableRow key={index} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                {formatPrice(price.price)}
              </TableCell>
              <TableCell>{formatAmount(price.amount)} USDT</TableCell>
              <TableCell>
                <div
                  className="max-w-[120px] truncate"
                  title={price.advertiser.name}
                >
                  {price.advertiser.name}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {price.advertiser.rating.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell>{price.advertiser.orderCount}</TableCell>
              <TableCell>
                <span className="text-sm">
                  {price.advertiser.completionRate.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {price.paymentMethods
                    .slice(0, 2)
                    .map((method, methodIndex) => (
                      <Badge
                        key={methodIndex}
                        variant="outline"
                        className="text-xs"
                      >
                        {method}
                      </Badge>
                    ))}
                  {price.paymentMethods.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{price.paymentMethods.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
