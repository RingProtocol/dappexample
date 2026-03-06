"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Web3 } from "web3";
import { NETWORKS, GAS_CONFIG, UI_CONFIG } from "@/config/constants";

export interface NetworkInfo {
  chainId: number;
  name: string;
  explorer: string;
}

export function useWallet() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersSetup = useRef(false);

  const getBalance = useCallback(
    async (acct: string, w3: Web3) => {
      try {
        const balanceWei = await w3.eth.getBalance(acct);
        const balanceEth = w3.utils.fromWei(balanceWei, "ether");
        return parseFloat(balanceEth).toFixed(UI_CONFIG.BALANCE_DECIMALS);
      } catch (err) {
        console.error("Error fetching balance:", err);
        return "0";
      }
    },
    []
  );

  const getNetwork = useCallback(
    async (w3: Web3): Promise<NetworkInfo> => {
      const chainId = await w3.eth.getChainId();
      const network = NETWORKS[Number(chainId)] || {
        name: `Chain ID ${chainId}`,
        explorer: "",
      };
      return {
        chainId: Number(chainId),
        name: network.name,
        explorer: network.explorer,
      };
    },
    []
  );

  const updateBalance = useCallback(async () => {
    if (web3 && account) {
      const bal = await getBalance(account, web3);
      setBalance(bal);
    }
  }, [web3, account, getBalance]);

  const checkExistingConnection = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return null;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        const w3 = new Web3(window.ethereum);
        setWeb3(w3);
        setAccount(accounts[0]);
        const bal = await getBalance(accounts[0], w3);
        setBalance(bal);
        const net = await getNetwork(w3);
        setNetwork(net);
        return accounts[0];
      }
    } catch (err) {
      console.error("Error checking existing connection:", err);
    }
    return null;
  }, [getBalance, getNetwork]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Please install MetaMask or another Web3 wallet!");
    }

    setIsConnecting(true);
    setError(null);

    try {
      const w3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const acct = accounts[0];
      setWeb3(w3);
      setAccount(acct);
      const bal = await getBalance(acct, w3);
      setBalance(bal);
      const net = await getNetwork(w3);
      setNetwork(net);
      return acct;
    } catch (err: any) {
      setError(err.message || "Error connecting wallet");
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [getBalance, getNetwork]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setWeb3(null);
    setBalance("0");
    setNetwork(null);
  }, []);

  const isValidAddress = useCallback(
    (address: string): boolean => {
      if (!web3) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      }
      return web3.utils.isAddress(address);
    },
    [web3]
  );

  const sendTransaction = useCallback(
    async (to: string, amount: string) => {
      if (!web3 || !account) {
        throw new Error("Wallet not connected");
      }

      if (!isValidAddress(to)) {
        throw new Error("Invalid recipient address");
      }

      const value = web3.utils.toWei(amount.toString(), "ether");

      const tx = {
        from: account,
        to: to,
        value: value,
        gas: GAS_CONFIG.STANDARD_TRANSFER,
      };

      return await web3.eth.sendTransaction(tx);
    },
    [web3, account, isValidAddress]
  );

  const getExplorerUrl = useCallback(
    (hash: string): string => {
      if (hash.startsWith("pending")) return "#";
      return (network?.explorer || NETWORKS[1].explorer) + hash;
    },
    [network]
  );

  // Setup event listeners
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum || listenersSetup.current) return;

    listenersSetup.current = true;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        checkExistingConnection();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [disconnect, checkExistingConnection]);

  // Check existing connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, [checkExistingConnection]);

  return {
    web3,
    account,
    balance,
    network,
    isConnecting,
    error,
    isAvailable: typeof window !== "undefined" && !!window.ethereum,
    isConnected: !!account,
    connect,
    disconnect,
    updateBalance,
    isValidAddress,
    sendTransaction,
    getExplorerUrl,
  };
}
