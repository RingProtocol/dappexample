/**
 * Tokens Module
 * Handles ERC20 token import, storage, and balance fetching
 */

import { ERC20_ABI } from './config.js';
import { TokenStorage } from './storage.js';
import { wallet } from './wallet.js';

/**
 * Token Manager Class
 */
class TokenManager {
    constructor() {
        this.tokens = [];
        this.balances = new Map();
    }

    /**
     * Load tokens from storage
     */
    load() {
        this.tokens = TokenStorage.getAll();
        return this.tokens;
    }

    /**
     * Get all tokens
     * @returns {Array}
     */
    getAll() {
        return this.tokens;
    }

    /**
     * Import a new token
     * @param {string} address - Token contract address
     * @param {string} [symbol] - Optional token symbol
     * @param {number} [decimals] - Optional token decimals
     * @returns {Promise<Object>} Token object
     */
    async import(address, symbol, decimals) {
        const web3 = wallet.getWeb3();
        const account = wallet.getAccount();

        if (!web3 || !account) {
            throw new Error('Wallet not connected');
        }

        if (!wallet.isValidAddress(address)) {
            throw new Error('Invalid token contract address');
        }

        if (TokenStorage.exists(address)) {
            throw new Error('Token already imported');
        }

        const tokenContract = new web3.eth.Contract(ERC20_ABI, address);

        // Fetch token info
        const tokenInfo = await this._fetchTokenInfo(tokenContract, symbol, decimals);

        // Save to storage
        const token = {
            address: address,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals
        };

        TokenStorage.save(token);
        this.tokens.push(token);

        // Fetch initial balance
        await this.fetchBalance(token);

        return token;
    }

    /**
     * Remove a token
     * @param {string} address - Token address
     */
    remove(address) {
        TokenStorage.remove(address);
        this.balances.delete(address.toLowerCase());
        this.tokens = this.tokens.filter(
            t => t.address.toLowerCase() !== address.toLowerCase()
        );
    }

    /**
     * Fetch balance for a single token
     * @param {Object} token - Token object
     * @returns {Promise<string>} Formatted balance
     */
    async fetchBalance(token) {
        const web3 = wallet.getWeb3();
        const account = wallet.getAccount();

        if (!web3 || !account) {
            return null;
        }

        try {
            const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address);
            const balance = await tokenContract.methods.balanceOf(account).call();
            const formattedBalance = (balance / Math.pow(10, token.decimals)).toFixed(4);
            
            this.balances.set(token.address.toLowerCase(), {
                raw: balance,
                formatted: formattedBalance,
                symbol: token.symbol
            });

            return formattedBalance;
        } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error);
            this.balances.set(token.address.toLowerCase(), {
                raw: '0',
                formatted: 'Error',
                symbol: token.symbol
            });
            return 'Error';
        }
    }

    /**
     * Fetch balances for all tokens
     * @returns {Promise<Map>}
     */
    async fetchAllBalances() {
        const promises = this.tokens.map(token => this.fetchBalance(token));
        await Promise.all(promises);
        return this.balances;
    }

    /**
     * Get cached balance for a token
     * @param {string} address - Token address
     * @returns {Object|null}
     */
    getBalance(address) {
        return this.balances.get(address.toLowerCase()) || null;
    }

    /**
     * Fetch token info from contract
     * @private
     */
    async _fetchTokenInfo(contract, symbol, decimals) {
        const info = {};

        if (symbol) {
            info.symbol = symbol;
        } else {
            try {
                info.symbol = await contract.methods.symbol().call();
            } catch (error) {
                throw new Error('Could not fetch token symbol. Please provide it manually.');
            }
        }

        if (decimals !== undefined && decimals !== null && decimals !== '') {
            info.decimals = parseInt(decimals);
        } else {
            try {
                info.decimals = parseInt(await contract.methods.decimals().call());
            } catch (error) {
                info.decimals = 18; // Default to 18
            }
        }

        return info;
    }
}

// Export singleton instance
export const tokenManager = new TokenManager();
