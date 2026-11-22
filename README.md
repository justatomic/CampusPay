# CampusPay ⚡

### Campus payments, without the friction.

CampusPay is a student-focused payment platform built on the **Stellar blockchain**, designed to simplify peer-to-peer payments, shared expenses, and transaction verification for Nigerian university students.

By combining Stellar's fast, low-cost payment infrastructure with a simple interface, CampusPay makes blockchain-powered payments more accessible to campus communities.

🌐 **Live Demo:** https://campus-pay-umber.vercel.app/

---

## ✨ Features

- 🔗 **Varial Wallet Integration** – Connect your Stellar wallet securely.
- 💰 **Live XLM Balance** – View your connected wallet balance.
- 💸 **Send Payments** – Transfer XLM to other Stellar addresses.
- 📥 **Receive Payments** – Share your wallet address and payment QR code.
- 👥 **Split Bills** – Divide shared expenses and track contributions.
- 📊 **Transaction History** – View and verify blockchain transactions.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Application framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Stellar SDK | Blockchain interactions |
| Varial SDK | Wallet connection and transaction signing |
| React QR Code Logo | Payment QR codes |
| Vercel | Deployment |

## 🌍 Why Stellar?

Stellar provides the blockchain infrastructure behind CampusPay.

We use Stellar for:

- Fast and low-cost XLM transfers.
- Transparent, publicly verifiable transactions.
- Secure wallet-based transaction approvals.
- A foundation for accessible cross-border payments.

CampusPay handles the user experience while Stellar handles the underlying blockchain transactions.

## 🚀 Getting Started

### Prerequisites

Before running CampusPay locally, you'll need:

- Node.js and npm.
- Git.
- A Varial wallet browser extension.
- A Stellar Testnet account funded with test XLM.

### Installation

Clone the repository:

```bash
git clone https://github.com/justatomic/CampusPay.git
```

Navigate into the project:

```bash
cd CampusPay
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 👛 Wallet Setup

CampusPay uses Varial to connect to Stellar accounts and authorize transactions.

1. Install [Varial Wallet](https://varialwallet.com/).
2. Create or import a Stellar wallet.
3. Switch to the Stellar Testnet network.
4. Fund your test account using [Stellar Laboratory](https://laboratory.stellar.org/).
5. Open CampusPay and connect your wallet.

**Note:** CampusPay currently targets Stellar Testnet. Test XLM has no real monetary value.

## 📁 Project Structure

```text
campuspay/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   ├── types.ts
│   ├── stellar.ts
│   └── wallet-context.tsx
│
├── components/
│   ├── AppShell.tsx
│   ├── ConnectWallet.tsx
│   ├── Dashboard.tsx
│   ├── SendPayment.tsx
│   ├── ReceivePayment.tsx
│   ├── SplitBill.tsx
│   ├── TransactionHistory.tsx
│   └── ui/
│
├── public/
├── package.json
└── README.md
```

## 🔐 Security

- CampusPay never requests or stores wallet secret keys.
- Transactions require explicit wallet authorization.
- Wallet signing is handled through Varial.
- Testnet is used for development and demonstration.

Never share your wallet recovery phrase or secret key.

## 🗺️ Roadmap

- [x] CampusPay landing experience.
- [x] Stellar Testnet integration setup.
- [x] Varial wallet integration.
- [ ] Complete peer-to-peer payment experience.
- [ ] Payment QR code generation.
- [ ] Shared expense management.
- [ ] Transaction verification and history.
- [ ] Mainnet readiness and security review.

## 🤝 Contributing

Contributions, suggestions and feedback are welcome!

1. Fork this repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a pull request.

## 👨‍💻 Developer

Built by **justatomic**.

GitHub: https://github.com/justatomic

---

<p align="center">
  Built for students. Powered by Stellar. ⚡
</p>
