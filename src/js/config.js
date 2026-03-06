/**
 * Configuration Module
 * Contains all constants, ABIs, and configuration values
 */

// Storage Keys
export const STORAGE_KEYS = {
    TOKENS: 'firstdapp_tokens',
    TRANSACTIONS: 'firstdapp_transactions'
};

// ERC20 Standard ABI
export const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// Network Configuration
export const NETWORKS = {
    1: { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io/tx/' },
    3: { name: 'Ropsten', explorer: 'https://ropsten.etherscan.io/tx/' },
    4: { name: 'Rinkeby', explorer: 'https://rinkeby.etherscan.io/tx/' },
    5: { name: 'Goerli', explorer: 'https://goerli.etherscan.io/tx/' },
    42: { name: 'Kovan', explorer: 'https://kovan.etherscan.io/tx/' },
    56: { name: 'BSC Mainnet', explorer: 'https://bscscan.com/tx/' },
    97: { name: 'BSC Testnet', explorer: 'https://testnet.bscscan.com/tx/' },
    137: { name: 'Polygon', explorer: 'https://polygonscan.com/tx/' },
    80001: { name: 'Mumbai', explorer: 'https://mumbai.polygonscan.com/tx/' },
    1337: { name: 'Local', explorer: '' },
    31337: { name: 'Hardhat', explorer: '' },
    11155111: { name: 'Sepolia', explorer: 'https://sepolia.etherscan.io/tx/' }
};

// Etherscan API URLs
export const ETHERSCAN_API_URLS = {
    1: 'https://api.etherscan.io/api',
    5: 'https://api-goerli.etherscan.io/api',
    11155111: 'https://api-sepolia.etherscan.io/api'
};

// Gas Configuration
export const GAS_CONFIG = {
    STANDARD_TRANSFER: 21000
};

// UI Configuration
export const UI_CONFIG = {
    ADDRESS_DISPLAY_LENGTH: 6,
    BALANCE_DECIMALS: 4,
    MAX_TRANSACTION_HISTORY: 50
};
