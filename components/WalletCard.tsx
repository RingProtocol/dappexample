"use client";

import { useState } from "react";
import { formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NetworkInfo } from "@/hooks/useWallet";

interface ChainOption {
  chainId: number;
  name: string;
}

interface WalletCardProps {
  isConnected: boolean;
  isConnecting: boolean;
  isSwitchingChain?: boolean;
  account: string | null;
  balance: string;
  network: NetworkInfo | null;
  switchableChains: ChainOption[];
  onConnect: () => void;
  onSwitchChain: (chainId: number) => Promise<void>;
}

export function WalletCard({
  isConnected,
  isConnecting,
  isSwitchingChain = false,
  account,
  balance,
  network,
  switchableChains,
  onConnect,
  onSwitchChain,
}: WalletCardProps) {
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);

  const handleSwitchChain = async (chainId: number) => {
    if (network?.chainId === chainId) return;
    setSwitchingTo(chainId);
    try {
      await onSwitchChain(chainId);
    } finally {
      setSwitchingTo(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-5 shadow-card">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Wallet</h2>

      <button
        type="button"
        onClick={() => onConnect()}
        disabled={isConnected || isConnecting}
        className={cn(
          "w-full py-3.5 px-6 rounded-lg font-semibold transition-all",
          "bg-gradient-to-r from-primary to-primary-dark text-white",
          "hover:-translate-y-0.5 hover:shadow-button",
          "disabled:translate-none disabled:shadow-none disabled:bg-gray-400 disabled:cursor-not-allowed"
        )}
      >
        {isConnecting
          ? "Connecting..."
          : isConnected
            ? "Connected ✓"
            : "Connect Wallet"}
      </button>

      {isConnected && account && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
          {network && switchableChains.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-500 font-medium">Network:</span>
              <div className="flex flex-wrap gap-2">
                {switchableChains.map((chain) => (
                  <button
                    key={chain.chainId}
                    type="button"
                    onClick={() => handleSwitchChain(chain.chainId)}
                    disabled={
                      isSwitchingChain ||
                      (switchingTo !== null && switchingTo !== chain.chainId) ||
                      network.chainId === chain.chainId
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      network.chainId === chain.chainId
                        ? "bg-primary text-white cursor-default"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    )}
                  >
                    {network.chainId === chain.chainId
                      ? chain.name
                      : switchingTo === chain.chainId
                        ? "Switching..."
                        : chain.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-gray-500 font-medium">Account:</span>
            <span
              className="font-mono font-semibold text-gray-800 break-all"
              title={account}
            >
              {formatAddress(account)}
            </span>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-gray-500 font-medium">Balance:</span>
            <span className="font-mono font-semibold text-gray-800">
              {balance} ETH
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
