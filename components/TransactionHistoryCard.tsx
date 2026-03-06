"use client";

import { useState, useEffect } from "react";
import { formatAddress, formatTime, cn } from "@/lib/utils";
import type { Transaction } from "@/config/constants";

interface TransactionHistoryCardProps {
  transactions: Transaction[];
  networkName: string;
  explorerUrl: string;
  isLoading: boolean;
  onFetchEtherscan: (apiKey: string) => Promise<Transaction[]>;
}

type TabType = "app" | "etherscan";

export function TransactionHistoryCard({
  transactions,
  networkName,
  explorerUrl,
  isLoading,
  onFetchEtherscan,
}: TransactionHistoryCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("app");
  const [apiKey, setApiKey] = useState("");
  const [etherscanTxs, setEtherscanTxs] = useState<Transaction[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const displayedTransactions =
    activeTab === "app" ? transactions : etherscanTxs;

  const handleFetchEtherscan = async () => {
    if (!apiKey) {
      setFetchError("Please enter an Etherscan API key");
      return;
    }
    setFetchError(null);
    try {
      const txs = await onFetchEtherscan(apiKey);
      setEtherscanTxs(txs);
    } catch (err: any) {
      setFetchError(err.message);
    }
  };

  const getTxIcon = (type: string) => (type === "sent" ? "↗️" : "↙️");

  const getTxAmount = (tx: Transaction) =>
    `${tx.type === "sent" ? "-" : "+"}${tx.amount} ETH`;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBorderColor = (type: string, status: string) => {
    if (status === "pending") return "border-l-yellow-400";
    if (status === "failed") return "border-l-gray-400";
    return type === "sent" ? "border-l-red-400" : "border-l-green-400";
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-5 shadow-card">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Transaction History</h2>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("app")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg font-medium transition-all",
            activeTab === "app"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          )}
        >
          App History
        </button>
        <button
          onClick={() => setActiveTab("etherscan")}
          className={cn(
            "flex-1 py-2.5 px-4 rounded-lg font-medium transition-all",
            activeTab === "etherscan"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          )}
        >
          From Etherscan
        </button>
      </div>

      {/* Etherscan API Section */}
      {activeTab === "etherscan" && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Etherscan API Key (optional)"
            className={cn(
              "w-full p-3 border-2 border-gray-200 rounded-lg mb-2",
              "text-sm font-sans",
              "focus:outline-none focus:border-primary",
              "placeholder:text-gray-400"
            )}
          />
          <button
            onClick={handleFetchEtherscan}
            disabled={isLoading}
            className={cn(
              "w-full py-2.5 px-4 rounded-lg font-semibold transition-all",
              "bg-gray-100 text-gray-800",
              "hover:bg-gray-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? "Fetching..." : "Fetch History"}
          </button>
          {fetchError && (
            <p className="mt-2 text-sm text-error">{fetchError}</p>
          )}
        </div>
      )}

      {/* Transaction List */}
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {displayedTransactions.length === 0 ? (
          <p className="text-center text-gray-400 py-6">
            {activeTab === "app"
              ? "No transactions yet. Send ETH to see your history."
              : "Enter API key to fetch Etherscan history."}
          </p>
        ) : (
          displayedTransactions.map((tx) => (
            <div
              key={tx.hash}
              className={cn(
                "flex justify-between items-start p-4 bg-gray-50 rounded-lg",
                "border-l-4 transition-colors hover:bg-gray-100",
                getBorderColor(tx.type, tx.status),
                tx.status === "failed" && "opacity-70"
              )}
            >
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-bold text-sm",
                      tx.type === "sent"
                        ? "text-error"
                        : tx.type === "received"
                        ? "text-success"
                        : tx.status === "pending"
                        ? "text-warning"
                        : "text-gray-400"
                    )}
                  >
                    {getTxIcon(tx.type)} {tx.type === "sent" ? "Sent" : "Received"}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      getStatusClass(tx.status)
                    )}
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>
                <div className="font-mono text-xs text-gray-500">
                  {tx.hash.startsWith("pending") ? (
                    "Pending..."
                  ) : (
                    <a
                      href={explorerUrl + tx.hash}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {formatAddress(tx.hash)}
                    </a>
                  )}
                </div>
                {tx.to && (
                  <div className="text-xs text-gray-400">
                    To: {formatAddress(tx.to)}
                    {networkName && ` • ${networkName}`}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "font-bold text-base",
                    tx.type === "sent" ? "text-error" : "text-success"
                  )}
                >
                  {getTxAmount(tx)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatTime(tx.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
