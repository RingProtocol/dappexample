/**
 * Main Entry Point
 * Initializes the application and sets up event handlers
 */

import { wallet } from './wallet.js';
import { tokenManager } from './tokens.js';
import { transactionManager } from './transactions.js';
import { UI_CONFIG } from './config.js';

/**
 * UI Controller Class
 */
class UIController {
    constructor() {
        this.elements = {};
        this.currentTxTab = 'app';
    }

    /**
     * Initialize DOM element references
     */
    initElements() {
        this.elements = {
            // Wallet
            connectBtn: document.getElementById('connectBtn'),
            walletInfo: document.getElementById('walletInfo'),
            accountDisplay: document.getElementById('accountDisplay'),
            balanceDisplay: document.getElementById('balanceDisplay'),
            sendCard: document.getElementById('sendCard'),

            // Send Transaction
            sendToAddress: document.getElementById('sendToAddress'),
            sendAmount: document.getElementById('sendAmount'),
            sendBtn: document.getElementById('sendBtn'),

            // Token Import
            tokenAddress: document.getElementById('tokenAddress'),
            tokenSymbol: document.getElementById('tokenSymbol'),
            tokenDecimals: document.getElementById('tokenDecimals'),
            importTokenBtn: document.getElementById('importTokenBtn'),
            tokenList: document.getElementById('tokenList'),

            // Transactions
            transactionList: document.getElementById('transactionList'),
            etherscanApiSection: document.getElementById('etherscanApiSection'),
            etherscanApiKey: document.getElementById('etherscanApiKey'),
            fetchEtherscanBtn: document.getElementById('fetchEtherscanBtn'),
            txTabs: document.querySelectorAll('.tx-tab')
        };
    }

    /**
     * Show/hide wallet info after connection
     * @param {boolean} connected
     */
    setWalletConnected(connected) {
        const { connectBtn, walletInfo, sendCard } = this.elements;
        
        if (connected) {
            connectBtn.textContent = 'Connected ✓';
            connectBtn.disabled = true;
            walletInfo.style.display = 'block';
            sendCard.style.display = 'block';
        } else {
            connectBtn.textContent = 'Connect Wallet';
            connectBtn.disabled = false;
            walletInfo.style.display = 'none';
            sendCard.style.display = 'none';
        }
    }

    /**
     * Update account display
     * @param {string} account
     */
    updateAccountDisplay(account) {
        const formatted = wallet.formatAddress(account);
        this.elements.accountDisplay.textContent = formatted;
        this.elements.accountDisplay.title = account;
    }

    /**
     * Update balance display
     * @param {string} balance
     */
    updateBalanceDisplay(balance) {
        this.elements.balanceDisplay.textContent = `${balance} ETH`;
    }

    /**
     * Render token list
     */
    renderTokenList() {
        const { tokenList } = this.elements;
        const tokens = tokenManager.getAll();

        if (tokens.length === 0) {
            tokenList.innerHTML = '<p class="empty-state">No tokens imported yet</p>';
            return;
        }

        tokenList.innerHTML = tokens.map(token => `
            <div class="token-item">
                <div class="token-info">
                    <span class="token-symbol">${this.escapeHtml(token.symbol)}</span>
                    <span class="token-address" title="${token.address}">
                        ${wallet.formatAddress(token.address)}
                    </span>
                </div>
                <div class="token-actions">
                    <span class="token-balance" id="balance-${token.address}">-</span>
                    <button class="btn btn-danger" onclick="window.removeToken('${token.address}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update token balances in UI
     */
    async updateTokenBalances() {
        const tokens = tokenManager.getAll();
        
        for (const token of tokens) {
            const balance = await tokenManager.fetchBalance(token);
            const el = document.getElementById(`balance-${token.address}`);
            if (el) {
                el.textContent = balance ? `${balance} ${token.symbol}` : '-';
            }
        }
    }

    /**
     * Render transaction list
     * @param {Array} transactions
     */
    renderTransactions(transactions) {
        const { transactionList } = this.elements;

        if (transactions.length === 0) {
            const message = this.currentTxTab === 'app'
                ? 'No transactions yet. Send ETH to see your history.'
                : 'Enter API key to fetch Etherscan history.';
            transactionList.innerHTML = `<p class="empty-state">${message}</p>`;
            return;
        }

        transactionList.innerHTML = transactions.map(tx => this.createTransactionHTML(tx)).join('');
    }

    /**
     * Create HTML for a single transaction
     * @param {Object} tx
     * @returns {string}
     */
    createTransactionHTML(tx) {
        const isPending = tx.status === 'pending';
        const isFailed = tx.status === 'failed';
        const icon = tx.type === 'sent' ? '↗️' : '↙️';
        const amount = tx.type === 'sent' ? `-${tx.amount} ETH` : `+${tx.amount} ETH`;
        const statusClass = tx.status === 'confirmed' ? 'confirmed' : tx.status;
        const statusText = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
        const hashDisplay = isPending ? 'Pending...' : wallet.formatAddress(tx.hash);
        const explorerUrl = transactionManager.getExplorerUrl(tx.hash);

        return `
            <div class="tx-item ${tx.type} ${tx.status}">
                <div class="tx-info">
                    <div class="tx-type ${tx.type}">
                        ${icon} ${tx.type === 'sent' ? 'Sent' : 'Received'}
                        <span class="tx-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="tx-hash">
                        ${isPending 
                            ? hashDisplay 
                            : `<a href="${explorerUrl}" target="_blank" rel="noopener">${hashDisplay}</a>`
                        }
                    </div>
                    <div class="tx-details">
                        ${tx.to ? `To: ${wallet.formatAddress(tx.to)}` : ''}
                        ${tx.network ? `• ${tx.network}` : ''}
                    </div>
                </div>
                <div class="tx-amount-wrapper">
                    <div class="tx-amount ${tx.type}">${amount}</div>
                    <div class="tx-time">${transactionManager.formatTime(tx.timestamp)}</div>
                </div>
            </div>
        `;
    }

    /**
     * Clear token import form
     */
    clearTokenForm() {
        this.elements.tokenAddress.value = '';
        this.elements.tokenSymbol.value = '';
        this.elements.tokenDecimals.value = '';
    }

    /**
     * Clear send form
     */
    clearSendForm() {
        this.elements.sendToAddress.value = '';
        this.elements.sendAmount.value = '';
    }

    /**
     * Show message toast
     * @param {string} message
     * @param {string} type - 'error' | 'success'
     */
    showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());

        const messageEl = document.createElement('div');
        messageEl.className = type === 'error' ? 'error-message' : 'success-message';
        messageEl.textContent = message;

        // Find active card or append to body
        const activeCard = document.querySelector('.card:hover') || document.body;
        activeCard.appendChild(messageEl);

        setTimeout(() => messageEl.remove(), 5000);
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create singleton instances
const ui = new UIController();

/**
 * Event Handlers
 */
async function handleConnect() {
    try {
        await wallet.connect();
        await onWalletConnected();
    } catch (error) {
        ui.showMessage(error.message, 'error');
    }
}

async function handleSendTransaction() {
    const to = ui.elements.sendToAddress.value.trim();
    const amount = ui.elements.sendAmount.value.trim();

    if (!to || !wallet.isValidAddress(to)) {
        ui.showMessage('Please enter a valid recipient address!', 'error');
        return;
    }

    if (!amount || parseFloat(amount) <= 0) {
        ui.showMessage('Please enter a valid amount!', 'error');
        return;
    }

    try {
        await transactionManager.sendETH(to, amount);
        ui.showMessage('Transaction sent successfully!', 'success');
        ui.clearSendForm();
        
        // Update UI
        const balance = await wallet.getBalance();
        ui.updateBalanceDisplay(balance);
        loadAppTransactions();
    } catch (error) {
        ui.showMessage(error.message, 'error');
    }
}

async function handleImportToken() {
    const address = ui.elements.tokenAddress.value.trim();
    const symbol = ui.elements.tokenSymbol.value.trim();
    const decimals = ui.elements.tokenDecimals.value.trim();

    try {
        await tokenManager.import(address, symbol, decimals);
        ui.showMessage(`Token imported successfully!`, 'success');
        ui.clearTokenForm();
        ui.renderTokenList();
        await ui.updateTokenBalances();
    } catch (error) {
        ui.showMessage(error.message, 'error');
    }
}

async function handleRemoveToken(address) {
    tokenManager.remove(address);
    ui.renderTokenList();
    await ui.updateTokenBalances();
}

function loadAppTransactions() {
    const txs = transactionManager.getAppHistory();
    ui.renderTransactions(txs);
}

async function handleFetchEtherscan() {
    const apiKey = ui.elements.etherscanApiKey.value.trim();
    
    if (!apiKey) {
        ui.showMessage('Please enter an Etherscan API key', 'error');
        return;
    }

    try {
        const txs = await transactionManager.fetchEtherscanHistory(apiKey);
        ui.renderTransactions(txs);
    } catch (error) {
        ui.showMessage(error.message, 'error');
    }
}

function setupTxTabs() {
    ui.elements.txTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            ui.elements.txTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            ui.currentTxTab = tab.dataset.tab;

            if (ui.currentTxTab === 'etherscan') {
                ui.elements.etherscanApiSection.style.display = 'block';
                ui.renderTransactions([]); // Clear and wait for fetch
            } else {
                ui.elements.etherscanApiSection.style.display = 'none';
                loadAppTransactions();
            }
        });
    });
}

/**
 * Wallet Event Handlers
 */
async function onWalletConnected() {
    const account = wallet.getAccount();
    
    ui.setWalletConnected(true);
    ui.updateAccountDisplay(account);
    
    const balance = await wallet.getBalance();
    ui.updateBalanceDisplay(balance);
    
    // Load tokens and update balances
    tokenManager.load();
    ui.renderTokenList();
    await ui.updateTokenBalances();
    
    // Load transactions
    loadAppTransactions();
}

function onWalletDisconnected() {
    ui.setWalletConnected(false);
    ui.elements.transactionList.innerHTML = '<p class="empty-state">Connect wallet to view transactions</p>';
}

async function onAccountChanged(newAccount) {
    ui.updateAccountDisplay(newAccount);
    
    const balance = await wallet.getBalance();
    ui.updateBalanceDisplay(balance);
    
    await ui.updateTokenBalances();
    loadAppTransactions();
}

/**
 * Application Initialization
 */
async function init() {
    // Initialize UI elements
    ui.initElements();
    
    // Setup event listeners
    ui.elements.connectBtn.addEventListener('click', handleConnect);
    ui.elements.sendBtn.addEventListener('click', handleSendTransaction);
    ui.elements.importTokenBtn.addEventListener('click', handleImportToken);
    ui.elements.fetchEtherscanBtn.addEventListener('click', handleFetchEtherscan);
    setupTxTabs();

    // Expose removeToken to global scope for inline onclick
    window.removeToken = handleRemoveToken;

    // Setup wallet event listeners
    wallet.on('connected', onWalletConnected);
    wallet.on('disconnected', onWalletDisconnected);
    wallet.on('accountChanged', onAccountChanged);

    // Check for existing connection
    const existingAccount = await wallet.checkExistingConnection();
    if (existingAccount) {
        await onWalletConnected();
    }

    // Load tokens (for display even when not connected)
    tokenManager.load();
    ui.renderTokenList();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
