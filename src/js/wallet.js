/**
 * Wallet Module
 * Handles wallet connection, account management, and balance operations
 */

import { NETWORKS, GAS_CONFIG, UI_CONFIG } from './config.js';

class WalletManager {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.listeners = {
            accountChanged: [],
            networkChanged: [],
            connected: [],
            disconnected: []
        };
    }

    /**
     * Check if Web3 provider is available
     * @returns {boolean}
     */
    isAvailable() {
        return typeof window.ethereum !== 'undefined';
    }

    /**
     * Check if wallet is already connected (without prompting)
     * @returns {Promise<string|null>} Connected account or null
     */
    async checkExistingConnection() {
        if (!this.isAvailable()) return null;

        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.web3 = new Web3(window.ethereum);
                this.account = accounts[0];
                this._setupListeners();
                return this.account;
            }
        } catch (error) {
            console.error('Error checking existing connection:', error);
        }
        return null;
    }

    /**
     * Connect wallet (prompts user)
     * @returns {Promise<string>} Connected account
     */
    async connect() {
        if (!this.isAvailable()) {
            throw new Error('Please install MetaMask or another Web3 wallet!');
        }

        try {
            this.web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            this._setupListeners();
            this._emit('connected', this.account);
            return this.account;
        } catch (error) {
            throw new Error('Error connecting wallet: ' + error.message);
        }
    }

    /**
     * Disconnect wallet (clear local state)
     */
    disconnect() {
        this.account = null;
        this._emit('disconnected');
    }

    /**
     * Get current account
     * @returns {string|null}
     */
    getAccount() {
        return this.account;
    }

    /**
     * Get Web3 instance
     * @returns {Web3|null}
     */
    getWeb3() {
        return this.web3;
    }

    /**
     * Get ETH balance for current account
     * @returns {Promise<string>} Balance in ETH (formatted)
     */
    async getBalance() {
        if (!this.web3 || !this.account) {
            throw new Error('Wallet not connected');
        }

        const balance = await this.web3.eth.getBalance(this.account);
        const balanceInEth = this.web3.utils.fromWei(balance, 'ether');
        return parseFloat(balanceInEth).toFixed(UI_CONFIG.BALANCE_DECIMALS);
    }

    /**
     * Get current network info
     * @returns {Promise<{chainId: number, name: string, explorer: string}>}
     */
    async getNetwork() {
        if (!this.web3) {
            throw new Error('Wallet not connected');
        }

        const chainId = await this.web3.eth.getChainId();
        const network = NETWORKS[chainId] || { name: `Chain ID ${chainId}`, explorer: '' };
        
        return {
            chainId,
            name: network.name,
            explorer: network.explorer
        };
    }

    /**
     * Validate Ethereum address
     * @param {string} address - Address to validate
     * @returns {boolean}
     */
    isValidAddress(address) {
        if (!this.web3) {
            // Fallback to basic check if web3 not initialized
            return /^0x[a-fA-F0-9]{40}$/.test(address);
        }
        return this.web3.utils.isAddress(address);
    }

    /**
     * Send ETH transaction
     * @param {string} to - Recipient address
     * @param {string} amount - Amount in ETH
     * @returns {Promise<Object>} Transaction receipt
     */
    async sendTransaction(to, amount) {
        if (!this.web3 || !this.account) {
            throw new Error('Wallet not connected');
        }

        if (!this.isValidAddress(to)) {
            throw new Error('Invalid recipient address');
        }

        const value = this.web3.utils.toWei(amount.toString(), 'ether');

        const tx = {
            from: this.account,
            to: to,
            value: value,
            gas: GAS_CONFIG.STANDARD_TRANSFER
        };

        return await this.web3.eth.sendTransaction(tx);
    }

    /**
     * Format address for display (0x1234...abcd)
     * @param {string} address - Full address
     * @returns {string} Formatted address
     */
    formatAddress(address) {
        const len = UI_CONFIG.ADDRESS_DISPLAY_LENGTH;
        return `${address.slice(0, len + 2)}...${address.slice(-len)}`;
    }

    /**
     * Get explorer URL for transaction
     * @param {string} hash - Transaction hash
     * @param {string} networkName - Optional network name
     * @returns {string}
     */
    getExplorerUrl(hash, networkName) {
        if (hash.startsWith('pending')) return '#';
        
        const network = Object.values(NETWORKS).find(n => n.name === networkName);
        return (network?.explorer || NETWORKS[1].explorer) + hash;
    }

    /**
     * Register event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Setup Ethereum event listeners
     * @private
     */
    _setupListeners() {
        if (!window.ethereum) return;

        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                this.account = accounts[0];
                this._emit('accountChanged', this.account);
            }
        });

        window.ethereum.on('chainChanged', (chainId) => {
            this._emit('networkChanged', parseInt(chainId, 16));
            window.location.reload();
        });
    }

    /**
     * Emit event to registered listeners
     * @private
     */
    _emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

// Export singleton instance
export const wallet = new WalletManager();
