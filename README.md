# USDT/VES P2P Market

A minimalist MVP application for tracking Binance P2P prices between USDT and Venezuelan Bolivares (VES). Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Real-time P2P Prices**: Live data from Binance P2P API
- **Multiple View Modes**: Summary, Cards, and Table views
- **Best Price Tracking**: Automatically identifies best buy/sell offers
- **Auto-refresh**: Updates every 30 seconds
- **Responsive Design**: Works on desktop and mobile
- **Type Safety**: Full TypeScript support with Zod validation

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Type Safety**: TypeScript + Zod validation
- **State Management**: React hooks with custom useP2PData hook
- **API**: Axios for HTTP requests to Binance P2P API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd camveo
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── PriceCard.tsx     # Individual price card
│   ├── PriceList.tsx     # Table view component
│   └── PriceSummary.tsx  # Summary view component
├── hooks/                # Custom React hooks
│   └── useP2PData.ts     # P2P data management hook
└── lib/                  # Utility functions and types
    ├── types.ts          # TypeScript types and Zod schemas
    ├── binance-api.ts    # Binance P2P API service
    └── utils.ts          # Utility functions
```

## API Integration

The application integrates with Binance P2P API to fetch real-time trading data:

- **Endpoint**: `https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search`
- **Data**: USDT/VES trading pairs
- **Refresh Rate**: 30 seconds
- **Validation**: Zod schemas for type safety

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application is for informational purposes only. Always verify prices and terms before engaging in any cryptocurrency trading. The data is sourced from Binance P2P API and may not reflect current market conditions.
