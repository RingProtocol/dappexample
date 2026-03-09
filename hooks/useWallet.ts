"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Web3 } from "web3";
import {
  NETWORKS,
  GAS_CONFIG,
  UI_CONFIG,
  getRpcUrl,
  SWITCHABLE_CHAINS,
} from "@/config/constants";

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
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersSetup = useRef(false);

  const parseChainId = useCallback((raw: unknown): number => {
    if (typeof raw === "number" && Number.isInteger(raw)) return raw;
    const hex = String(raw);
    if (hex.startsWith("0x")) return parseInt(hex, 16);
    return parseInt(hex, 10);
  }, []);

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

  const getReadProvider = useCallback((chainId: number): Web3 => {
    if (chainId === 1) {
      const rpc = getRpcUrl(chainId);
      if (rpc) return new Web3(rpc);
    }
    else if (chainId === 11155111) {
      const rpc = getRpcUrl(chainId);
      if (rpc) return new Web3(rpc);
    }
    return new Web3(window.ethereum!);
  }, []);

  const checkExistingConnection = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return null;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        const rawChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        const chainId = parseChainId(rawChainId);
        const w3 = getReadProvider(chainId);
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
  }, [getBalance, getNetwork, getReadProvider, parseChainId]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Please install MetaMask or another Web3 wallet!");
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const acct = accounts[0];
      const rawChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const chainId = parseChainId(rawChainId);
      const w3 = getReadProvider(chainId);
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
  }, [getBalance, getNetwork, getReadProvider, parseChainId]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setWeb3(null);
    setBalance("0");
    setNetwork(null);
  }, []);

  const switchChain = useCallback(
    async (targetChainId: number) => {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("Wallet not available");
      }
      const chain = SWITCHABLE_CHAINS.find((c) => c.chainId === targetChainId);
      if (!chain) {
        throw new Error(`Unsupported chain: ${targetChainId}`);
      }
      setIsSwitchingChain(true);
      setError(null);
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chain.hexChainId }],
        });
        window.location.reload();
      } catch (err: any) {
        if (err?.code === 4902 || err?.message?.includes("Unrecognized chain")) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chain.hexChainId,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.explorer],
              },
            ],
          });
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chain.hexChainId }],
          });
          window.location.reload();
        } else {
          setError(err?.message || "Failed to switch chain");
          throw err;
        }
      } finally {
        setIsSwitchingChain(false);
      }
    },
    []
  );

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
      if (typeof window === "undefined" || !window.ethereum || !account) {
        throw new Error("Wallet not connected");
      }

      if (!isValidAddress(to)) {
        throw new Error("Invalid recipient address");
      }

      const value =
        web3?.utils.toWei(amount.toString(), "ether") ??
        new Web3().utils.toWei(amount.toString(), "ether");

      const tx = {
        from: account,
        to: to,
        value: value,
        gas: GAS_CONFIG.STANDARD_TRANSFER,
      };

      const walletWeb3 = new Web3(window.ethereum);
      return await walletWeb3.eth.sendTransaction(tx);
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
    isSwitchingChain,
    error,
    isAvailable: typeof window !== "undefined" && !!window.ethereum,
    isConnected: !!account,
    connect,
    disconnect,
    switchChain,
    updateBalance,
    isValidAddress,
    sendTransaction,
    getExplorerUrl,
  };
}
