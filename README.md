# First DApp - Next.js Architecture

A simple decentralized application built with Next.js, React, TypeScript, and Web3.js.

## Features

- 🔗 **Wallet Connection**: Connect to MetaMask or other Web3 wallets
- 💸 **Send ETH**: Send Ethereum transactions
- 🪙 **ERC20 Token Import**: Import and view ERC20 token balances
- 📜 **Transaction History**: View app history and fetch from Etherscan

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles with Tailwind
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── components/             # React components
│   ├── WalletCard.tsx      # Wallet connection UI
│   ├── SendTransactionCard.tsx  # Send ETH form
│   ├── TokenImportCard.tsx # Import token form
│   ├── TokenListCard.tsx   # Token list display
│   └── TransactionHistoryCard.tsx  # Transaction history
├── config/                 # Configuration
│   └── constants.ts        # Constants, ABIs, storage helpers
├── hooks/                  # Custom React hooks
│   ├── useWallet.ts        # Wallet connection hook
│   ├── useTokens.ts        # Token management hook
│   └── useTransactions.ts  # Transaction handling hook
├── lib/                    # Utility functions
│   └── utils.ts            # Helper functions
├── contracts/              # Smart contracts
│   └── SimpleStorage.sol   # Example Solidity contract
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- MetaMask or another Web3 wallet

### Installation

```bash
# Install dependencies
yarn install

# Run development server
yarn run dev

# Build for production
yarn
 run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Web3**: [Web3.js v4](https://web3js.org/)

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Optional: Default chain ID
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Send ETH**: Enter recipient address and amount to send
3. **Import Tokens**: Add ERC20 token contract addresses to track
4. **View History**: Check app history or fetch from Etherscan

## License

MIT
