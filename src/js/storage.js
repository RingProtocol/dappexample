/**
 * Storage Module
 * Handles all localStorage operations for tokens and transactions
 */

import { STORAGE_KEYS } from './config.js';

/**
 * Token Storage Operations
 */
export const TokenStorage = {
    /**
     * Get all stored tokens
     * @returns {Array} Array of token objects
     */
    getAll() {
        try {
            const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
            return tokens ? JSON.parse(tokens) : [];
        } catch (error) {
            console.error('Error reading tokens from localStorage:', error);
            return [];
        }
    },

    /**
     * Save a new token
     * @param {Object} token - Token object {address, symbol, decimals}
     */
    save(token) {
        const tokens = this.getAll();
        tokens.push({
            ...token,
            addedAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    },

    /**
     * Remove a token by address
     * @param {string} address - Token contract address
     */
    remove(address) {
        const tokens = this.getAll();
        const filtered = tokens.filter(
            t => t.address.toLowerCase() !== address.toLowerCase()
        );
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(filtered));
    },

    /**
     * Check if token exists
     * @param {string} address - Token contract address
     * @returns {boolean}
     */
    exists(address) {
        const tokens = this.getAll();
        return tokens.some(t => t.address.toLowerCase() === address.toLowerCase());
    }
};

/**
 * Transaction Storage Operations
 */
export const TransactionStorage = {
    /**
     * Get all stored transactions for an account
     * @param {string} account - Ethereum address
     * @returns {Array} Array of transaction objects
     */
    getAll(account) {
        try {
            const allTxs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '{}');
            return allTxs[account?.toLowerCase()] || [];
        } catch (error) {
            console.error('Error reading transactions from localStorage:', error);
            return [];
        }
    },

    /**
     * Add a new transaction
     * @param {string} account - Ethereum address
     * @param {Object} tx - Transaction object
     */
    add(account, tx) {
        const allTxs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '{}');
        const accountKey = account.toLowerCase();

        if (!allTxs[accountKey]) {
            allTxs[accountKey] = [];
        }

        allTxs[accountKey].unshift(tx);
        
        // Limit history size
        if (allTxs[accountKey].length > 50) {
            allTxs[accountKey] = allTxs[accountKey].slice(0, 50);
        }

        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTxs));
    },

    /**
     * Update an existing transaction
     * @param {string} account - Ethereum address
     * @param {string} oldHash - Original transaction hash (may be pending ID)
     * @param {Object} updates - Fields to update
     */
    update(account, oldHash, updates) {
        const allTxs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '{}');
        const accountKey = account.toLowerCase();

        if (allTxs[accountKey]) {
            const index = allTxs[accountKey].findIndex(tx => tx.hash === oldHash);
            if (index !== -1) {
                allTxs[accountKey][index] = { ...allTxs[accountKey][index], ...updates };
                localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTxs));
            }
        }
    },

    /**
     * Clear all transactions for an account
     * @param {string} account - Ethereum address
     */
    clear(account) {
        const allTxs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '{}');
        delete allTxs[account?.toLowerCase()];
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTxs));
    }
};
