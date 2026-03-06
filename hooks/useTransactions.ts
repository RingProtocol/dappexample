"use client";

import { useState, useCallback } from "react";
import { Web3 } from "web3";
import {
  TransactionStorage,
  ETHERSCAN_API_URLS,
  type Transaction,
} from "@/config/constants";

export function useTransactions(account: string | null, web3: Web3 | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send ETH and track transaction
  const sendETH = useCallback(
    async (
      to: string,
      amount: string,
      sendTx: (to: string, amount: string) => Promise<any>,
      networkName: string
    ): Promise<Transaction> => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      // Create pending transaction
      const pendingTx: Transaction = {
        hash: `pending-${Date.now()}`,
        type: "sent",
        to: to,
        from: account,
        amount: amount,
        status: "pending",
        timestamp: Date.now(),
        network: networkName,
      };

      TransactionStorage.add(account, pendingTx);

      try {
        // Send transaction
        const receipt = await sendTx(to, amount);

        // Update with actual hash and status
        const update: Partial<Transaction> = {
          hash: receipt.transactionHash,
          status: receipt.status ? "confirmed" : "failed",
          blockNumber: Number(receipt.blockNumber),
        };

        TransactionStorage.update(account, pendingTx.hash, update);

        return { ...pendingTx, ...update };
      } catch (err: any) {
        // Mark as failed on error
        TransactionStorage.update(account, pendingTx.hash, {
          status: "failed",
        });
        setError(err.message || "Transaction failed");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [account]
  );

  // Get local app transaction history
  const getAppHistory = useCallback((): Transaction[] => {
    return TransactionStorage.getAll(account);
  }, [account]);

  // Fetch transaction history from Etherscan
  const fetchEtherscanHistory = useCallback(
    async (apiKey: string, chainId: number): Promise<Transaction[]> => {
      if (!account || !web3) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      const apiUrl = ETHERSCAN_API_URLS[chainId];
      if (!apiUrl) {
        setIsLoading(false);
        throw new Error(`Etherscan not supported for chain ID: ${chainId}`);
      }

      try {
        const response = await fetch(
          `${apiUrl}?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
        );

        const data = await response.json();

        if (data.status !== "1") {
          throw new Error(data.message || "Failed to fetch from Etherscan");
        }

        // Transform Etherscan response to our format
        return data.result.slice(0, 20).map((tx: any) => {
          const isIncoming =
            tx.to.toLowerCase() === account.toLowerCase();

          return {
            hash: tx.hash,
            type: isIncoming ? "received" : "sent",
            to: tx.to,
            from: tx.from,
            amount: web3.utils.fromWei(tx.value, "ether"),
            status: tx.txreceipt_status === "1" ? "confirmed" : "failed",
            timestamp: parseInt(tx.timeStamp) * 1000,
            blockNumber: parseInt(tx.blockNumber),
          };
        });
      } catch (err: any) {
        setError(err.message || "Error fetching from Etherscan");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [account, web3]
  );

  return {
    sendETH,
    getAppHistory,
    fetchEtherscanHistory,
    isLoading,
    error,
  };
}
