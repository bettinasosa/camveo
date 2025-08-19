import { z } from "zod"

// Zod schemas for validation
export const BinanceP2PAdSchema = z.object({
  adv: z.object({
    advNo: z.string(),
    classify: z.string(),
    tradeType: z.string(),
    asset: z.string(),
    fiatUnit: z.string(),
    fiatSymbol: z.string(),
    price: z.string(),
    initAmount: z.string(),
    surplusAmount: z.string(),
    maxSingleTransAmount: z.string(),
    minSingleTransAmount: z.string(),
    buyerKycLimit: z.string(),
    buyerRegDaysLimit: z.string(),
    buyerBtcPositionLimit: z.string(),
    remarks: z.string().optional(),
    autoReplyMsg: z.string().optional(),
    payTimeLimit: z.number(),
    tradeMethods: z.array(
      z.object({
        payId: z.string(),
        payMethodId: z.string(),
        payType: z.string(),
        payAccount: z.string().optional(),
        payBank: z.string().optional(),
        paySubBank: z.string().optional(),
        identifier: z.string().optional(),
        iconUrlColor: z.string().optional()
      })
    ),
    userTradeCount: z.string(),
    userTradeCountSwitchRate: z.string(),
    userBuyTradeCount: z.string(),
    userSellTradeCount: z.string(),
    userGrade: z.number(),
    userIdentityIdentifyLevel: z.string(),
    tags: z.array(z.string()).optional()
  }),
  advertiser: z.object({
    userNo: z.string(),
    realName: z.string().optional(),
    nickName: z.string().optional(),
    margin: z.string(),
    marginUnit: z.string(),
    orderCount: z.string(),
    monthOrderCount: z.string(),
    monthFinishRate: z.string(),
    positiveRate: z.string(),
    advConfirmTime: z.number().optional(),
    email: z.string().optional(),
    userType: z.string(),
    tagIconUrls: z.array(z.string()).optional(),
    userGrade: z.number(),
    userIdentityIdentifyLevel: z.string(),
    userIdentityIdentifyLevelStr: z.string(),
    isAdd: z.boolean()
  })
})

export const BinanceP2PResponseSchema = z.object({
  code: z.string(),
  message: z.string().optional(),
  messageDetail: z.string().optional(),
  data: z.array(BinanceP2PAdSchema),
  total: z.number(),
  success: z.boolean()
})

// TypeScript types inferred from Zod schemas
export type BinanceP2PAd = z.infer<typeof BinanceP2PAdSchema>
export type BinanceP2PResponse = z.infer<typeof BinanceP2PResponseSchema>

// Additional types for the application
export interface PaymentMethod {
  payType: string
  payBank?: string
  paySubBank?: string
  payAccount?: string
}

export interface PriceData {
  price: number
  amount: number
  paymentMethods: PaymentMethod[]
  advertiser: {
    name: string
    rating: number
    orderCount: number
    completionRate: number
  }
  tradeType: "BUY" | "SELL"
}

export interface FilterOptions {
  tradeType: "BUY" | "SELL"
  paymentMethod?: string
  bank?: string
  minAmount?: number
  maxAmount?: number
}
