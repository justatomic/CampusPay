# CampusPay ⚡

A modern student payment platform built on the **Stellar Testnet** for Nigerian university students.

## Features

- 🔗 Connect Stellar wallet via Freighter
- 💰 View real XLM balance
- 📤 Send XLM to any Stellar address
- 📥 Generate payment QR codes
- 👥 Split bills with friends
- 📋 View full transaction history

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Blockchain:** Stellar Testnet via `@stellar/stellar-sdk`
- **Wallet:** Freighter (`@stellar/freighter-api`)
- **QR Codes:** `react-qrcode-logo`

## Getting Started

### Prerequisites

1. Install [Freighter wallet](https://freighter.app) browser extension
2. Switch Freighter to **Testnet**
3. Fund your testnet account at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### GitHub + Vercel

1. Push this repo to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Vercel auto-detects Next.js — no extra config needed
4. Deploy 🚀

No environment variables are required for Testnet. For Mainnet, update `HORIZON_URL` and `NETWORK_PASSPHRASE` in `lib/stellar.ts`.

## Project Structure

```
campuspay/
├── app/
│   ├── globals.css          # Design tokens (navy, electric blue)
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── types.ts             # TypeScript interfaces
│   ├── stellar.ts           # Stellar SDK + Freighter utilities
│   └── wallet-context.tsx   # React wallet state context
└── components/
    ├── AppShell.tsx          # Tab router + toast manager
    ├── ConnectWallet.tsx     # Landing / wallet gate
    ├── Dashboard.tsx         # Balance + quick actions
    ├── SendPayment.tsx       # Send XLM form
    ├── ReceivePayment.tsx    # QR code generator
    ├── SplitBill.tsx         # Multi-participant bill split
    ├── TransactionHistory.tsx
    ├── BottomNav.tsx
    └── ui/                  # Badge, Spinner, Toast
```

## Switching to Mainnet

In `lib/stellar.ts`, change:

```ts
export const HORIZON_URL = 'https://horizon.stellar.org';
export const NETWORK_PASSPHRASE = Networks.PUBLIC;
```

---

Built for Nigerian university students 🇳🇬
