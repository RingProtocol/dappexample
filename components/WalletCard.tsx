"use client";

import { formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  balance: string;
  onConnect: () => void;
}

export function WalletCard({
  isConnected,
  isConnecting,
  account,
  balance,
  onConnect,
}: WalletCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-5 shadow-card">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Wallet</h2>
      
      <button
        onClick={onConnect}
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
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
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
