# FirstDApp

A simple decentralized application (DApp) that runs in the browser with Web3 wallet integration.

## Features

1. ✅ **Browser Support** - Open directly in any modern browser
2. ✅ **Connect Wallet** - Connect to MetaMask or any Web3-compatible wallet
3. ✅ **View Balance** - Display ETH balance after connecting
4. ✅ **Send ETH** - Send ETH to any address
5. ✅ **Import ERC20 Tokens** - Add any ERC20 token by contract address
6. ✅ **Token Balances** - View imported token balances
7. ✅ **Persistent Storage** - Imported tokens and transactions saved to localStorage
8. ✅ **Transaction History** - View all your transactions

## Quick Start

1. Open `index.html` in your browser
2. Click "Connect Wallet" to connect MetaMask
3. View your ETH balance
4. Send ETH to other addresses
5. Import ERC20 tokens by entering contract address
6. View transaction history (App History + Etherscan)

## Project Structure

```
firstdapp/
├── index.html              # Entry point
├── src/
│   ├── js/                 # JavaScript modules
│   │   ├── main.js         # Application entry & UI controller
│   │   ├── config.js       # Constants, ABIs, configuration
│   │   ├── wallet.js       # Wallet connection & management
│   │   ├── tokens.js       # ERC20 token operations
│   │   ├── transactions.js # Transaction handling
│   │   └── storage.js      # localStorage operations
│   ├── css/                # Stylesheets
│   │   ├── main.css        # CSS entry point
│   │   ├── variables.css   # CSS variables & theme
│   │   ├── base.css        # Base styles & reset
│   │   ├── components.css  # UI components
│   │   └── layout.css      # Layout & responsive
│   └── assets/             # Images, fonts, etc.
├── contracts/              # Smart contracts
│   └── SimpleStorage.sol   # Example contract
└── docs/                   # Documentation
    ├── README.md           # This file
    └── features.md         # Technical documentation for AI
```

## Architecture

The project uses ES6 modules for clean separation of concerns:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  main.js    │────▶│   Wallet    │────▶│  Web3 / RPC │
│  (UI)       │     │  (wallet.js)│     └─────────────┘
└──────┬──────┘     └─────────────┘
       │            ┌─────────────┐
       ├───────────▶│   Tokens    │────▶┌─────────────┐
       │            │(tokens.js)  │     │  Contracts  │
       │            └─────────────┘     └─────────────┘
       │            ┌─────────────┐
       ├───────────▶│Transactions │────▶┌─────────────┐
       │            │(transact.js)│     │  Etherscan  │
       │            └─────────────┘     └─────────────┘
       │            ┌─────────────┐
       └───────────▶│   Storage   │────▶┌─────────────┐
                    │(storage.js) │     │localStorage │
                    └─────────────┘     └─────────────┘
```

## Transaction History

### App History
- Tracks all transactions made through this app
- Shows pending, confirmed, and failed transactions
- Stores locally in your browser

### Etherscan History
- Fetches complete on-chain history from Etherscan
- Requires a free Etherscan API key
- Get your API key at [etherscan.io/apis](https://etherscan.io/apis)

## Data Persistence

All data is stored in your browser's localStorage:
- **Tokens**: `firstdapp_tokens`
- **Transactions**: `firstdapp_transactions`

Data never leaves your device.

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- MetaMask or another Web3 wallet browser extension

## Development

No build step required! The app uses native ES6 modules.

```bash
# Simply open in browser
cd firstdapp
open index.html

# Or serve with any static server
npx serve .
python -m http.server 8080
```

## Token Import

When importing a token, you only need to provide the contract address. The app will automatically fetch:
- Token symbol
- Token decimals
- Your current balance

## License

Educational project. No license restrictions.
