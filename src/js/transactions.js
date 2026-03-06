/**
 * Transactions Module
 * Handles transaction sending, history tracking, and Etherscan integration
 */

import { TransactionStorage } from './storage.js';
import { ETHERSCAN_API_URLS } from './config.js';
import { wallet } from './wallet.js';

/**
 * Transaction Manager Class
 */
class TransactionManager {
    constructor() {
        this.currentTab = 'app';
    }

    /**
     * Send ETH and track transaction
     * @param {string} to - Recipient address
     * @param {string} amount - Amount in ETH
     * @returns {Promise<Object>} Transaction receipt
     */
    async sendETH(to, amount) {
        const account = wallet.getAccount();
        const network = await wallet.getNetwork();

        // Create pending transaction
        const pendingTx = {
            hash: `pending-${Date.now()}`,
            type: 'sent',
            to: to,
            from: account,
            amount: amount,
            status: 'pending',
            timestamp: Date.now(),
            network: network.name
        };

        TransactionStorage.add(account, pendingTx);

        try {
            // Send transaction
            const receipt = await wallet.sendTransaction(to, amount);

            // Update with actual hash and status
            const update = {
                hash: receipt.transactionHash,
                status: receipt.status ? 'confirmed' : 'failed',
                blockNumber: receipt.blockNumber
            };

            TransactionStorage.update(account, pendingTx.hash, update);

            return { ...pendingTx, ...update };
        } catch (error) {
            // Mark as failed on error
            TransactionStorage.update(account, pendingTx.hash, {
                status: 'failed'
            });
            throw error;
        }
    }

    /**
     * Get local app transaction history
     * @returns {Array}
     */
    getAppHistory() {
        return TransactionStorage.getAll(wallet.getAccount());
    }

    /**
     * Fetch transaction history from Etherscan
     * @param {string} apiKey - Etherscan API key
     * @returns {Promise<Array>}
     */
    async fetchEtherscanHistory(apiKey) {
        const account = wallet.getAccount();
        const network = await wallet.getNetwork();
        const web3 = wallet.getWeb3();

        const apiUrl = ETHERSCAN_API_URLS[network.chainId];
        if (!apiUrl) {
            throw new Error(`Etherscan not supported for network: ${network.name}`);
        }

        const response = await fetch(
            `${apiUrl}?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
        );

        const data = await response.json();

        if (data.status !== '1') {
            throw new Error(data.message || 'Failed to fetch from Etherscan');
        }

        // Transform Etherscan response to our format
        return data.result.slice(0, 20).map(tx => {
            const isIncoming = tx.to.toLowerCase() === account.toLowerCase();
            
            return {
                hash: tx.hash,
                type: isIncoming ? 'received' : 'sent',
                to: tx.to,
                from: tx.from,
                amount: web3.utils.fromWei(tx.value, 'ether'),
                status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed',
                timestamp: parseInt(tx.timeStamp) * 1000,
                network: network.name,
                blockNumber: parseInt(tx.blockNumber)
            };
        });
    }

    /**
     * Format time for display
     * @param {number} timestamp - Unix timestamp in ms
     * @returns {string}
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;

        return date.toLocaleDateString();
    }

    /**
     * Get transaction explorer URL
     * @param {string} hash - Transaction hash
     * @returns {string}
     */
    getExplorerUrl(hash) {
        return wallet.getExplorerUrl(hash);
    }
}

// Export singleton instance
export const transactionManager = new TransactionManager();
