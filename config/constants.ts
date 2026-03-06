import { Web3 } from "web3";

// Storage Keys
export const STORAGE_KEYS = {
  TOKENS: "firstdapp_tokens",
  TRANSACTIONS: "firstdapp_transactions",
};

// ERC20 Standard ABI
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// Network Configuration
export const NETWORKS: Record<
  number,
  { name: string; explorer: string }
> = {
  1: { name: "Ethereum Mainnet", explorer: "https://etherscan.io/tx/" },
  3: { name: "Ropsten", explorer: "https://ropsten.etherscan.io/tx/" },
  4: { name: "Rinkeby", explorer: "https://rinkeby.etherscan.io/tx/" },
  5: { name: "Goerli", explorer: "https://goerli.etherscan.io/tx/" },
  42: { name: "Kovan", explorer: "https://kovan.etherscan.io/tx/" },
  56: { name: "BSC Mainnet", explorer: "https://bscscan.com/tx/" },
  97: { name: "BSC Testnet", explorer: "https://testnet.bscscan.com/tx/" },
  137: { name: "Polygon", explorer: "https://polygonscan.com/tx/" },
  80001: { name: "Mumbai", explorer: "https://mumbai.polygonscan.com/tx/" },
  1337: { name: "Local", explorer: "" },
  31337: { name: "Hardhat", explorer: "" },
  11155111: { name: "Sepolia", explorer: "https://sepolia.etherscan.io/tx/" },
};

// Etherscan API URLs
export const ETHERSCAN_API_URLS: Record<number, string> = {
  1: "https://api.etherscan.io/api",
  5: "https://api-goerli.etherscan.io/api",
  11155111: "https://api-sepolia.etherscan.io/api",
};

// Gas Configuration
export const GAS_CONFIG = {
  STANDARD_TRANSFER: 21000,
};

// UI Configuration
export const UI_CONFIG = {
  ADDRESS_DISPLAY_LENGTH: 6,
  BALANCE_DECIMALS: 4,
  MAX_TRANSACTION_HISTORY: 50,
};

// Types
export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  addedAt?: string;
}

export interface Transaction {
  hash: string;
  type: "sent" | "received";
  to?: string;
  from?: string;
  amount: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  network?: string;
  blockNumber?: number;
}

// Storage Helpers
export const TokenStorage = {
  getAll(): Token[] {
    try {
      const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
      return tokens ? JSON.parse(tokens) : [];
    } catch (error) {
      console.error("Error reading tokens from localStorage:", error);
      return [];
    }
  },

  save(token: Token): void {
    const tokens = this.getAll();
    tokens.push({
      ...token,
      addedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
  },

  remove(address: string): void {
    const tokens = this.getAll();
    const filtered = tokens.filter(
      (t) => t.address.toLowerCase() !== address.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(filtered));
  },

  exists(address: string): boolean {
    const tokens = this.getAll();
    return tokens.some(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );
  },
};

export const TransactionStorage = {
  getAll(account: string | null): Transaction[] {
    if (!account) return [];
    try {
      const allTxs = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "{}"
      );
      return allTxs[account.toLowerCase()] || [];
    } catch (error) {
      console.error("Error reading transactions from localStorage:", error);
      return [];
    }
  },

  add(account: string, tx: Transaction): void {
    const allTxs = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "{}"
    );
    const accountKey = account.toLowerCase();

    if (!allTxs[accountKey]) {
      allTxs[accountKey] = [];
    }

    allTxs[accountKey].unshift(tx);

    // Limit history size
    if (allTxs[accountKey].length > UI_CONFIG.MAX_TRANSACTION_HISTORY) {
      allTxs[accountKey] = allTxs[accountKey].slice(
        0,
        UI_CONFIG.MAX_TRANSACTION_HISTORY
      );
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTxs));
  },

  update(
    account: string,
    oldHash: string,
    updates: Partial<Transaction>
  ): void {
    const allTxs = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || "{}"
    );
    const accountKey = account.toLowerCase();

    if (allTxs[accountKey]) {
      const index = allTxs[accountKey].findIndex((tx: Transaction) => tx.hash === oldHash);
      if (index !== -1) {
        allTxs[accountKey][index] = { ...allTxs[accountKey][index], ...updates };
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTxs));
      }
    }
  },
};
