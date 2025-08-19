import { NextRequest, NextResponse } from "next/server"

const BINANCE_P2P_API_BASE = "https://p2p.binance.com/bapi/c2c/v2"

/**
 * API route to proxy Binance P2P requests and avoid CORS issues
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      asset = "USDT",
      fiat = "VES",
      tradeType = "BUY",
      rows = 20,
      page = 1
    } = body

    // Validate input parameters
    if (!["USDT", "BTC", "ETH"].includes(asset)) {
      return NextResponse.json(
        { error: "Invalid asset. Supported: USDT, BTC, ETH" },
        { status: 400 }
      )
    }

    if (!["BUY", "SELL"].includes(tradeType)) {
      return NextResponse.json(
        { error: "Invalid trade type. Must be BUY or SELL" },
        { status: 400 }
      )
    }

    // Binance API seems to have issues with certain row values
    // Limit to values that work reliably
    if (rows < 1 || rows > 20) {
      return NextResponse.json(
        { error: "Rows must be between 1 and 20 for reliable results" },
        { status: 400 }
      )
    }

    // For BUY requests, we need to look for SELL offers (people selling USDT)
    // For SELL requests, we need to look for BUY offers (people buying USDT)
    const binanceTradeType = tradeType === "BUY" ? "SELL" : "BUY"

    console.log("Making request to Binance API with params:", {
      asset,
      fiat,
      tradeType,
      binanceTradeType,
      rows,
      page
    })

    // Make request to Binance API
    const response = await fetch(
      `${BINANCE_P2P_API_BASE}/friendly/c2c/adv/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; Camveo-P2P/1.0)"
        },
        body: JSON.stringify({
          page,
          rows,
          payTypes: [],
          asset,
          tradeType: binanceTradeType,
          fiat,
          publisherType: null
        })
      }
    )

    if (!response.ok) {
      console.error("Binance API error:", response.status, response.statusText)
      throw new Error(`Binance API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Binance API response received:", {
      success: data.success,
      total: data.total,
      dataLength: data.data?.length || 0
    })

    // Basic validation
    if (!data.success) {
      console.error("Binance API error response:", data)
      return NextResponse.json(
        {
          error: `Binance API error: ${
            data.message || data.messageDetail || "Unknown error"
          }`
        },
        { status: 400 }
      )
    }

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
  } catch (error) {
    console.error("P2P API error:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET method for health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "P2P API proxy is running",
    timestamp: new Date().toISOString()
  })
}

/**
 * OPTIONS method for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}
