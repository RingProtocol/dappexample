"use client";

import { formatAddress } from "@/lib/utils";
import type { Token } from "@/config/constants";

interface TokenListCardProps {
  tokens: Token[];
  balances: Map<string, { formatted: string; symbol: string }>;
  isConnected: boolean;
  onRemove: (address: string) => void;
}

export function TokenListCard({
  tokens,
  balances,
  isConnected,
  onRemove,
}: TokenListCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-5 shadow-card">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Your Tokens</h2>
      
      {tokens.length === 0 ? (
        <p className="text-center text-gray-400 py-6">No tokens imported yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tokens.map((token) => {
            const balance = balances.get(token.address.toLowerCase());
            return (
              <div
                key={token.address}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-800 text-lg">
                    {token.symbol}
                  </span>
                  <span
                    className="font-mono text-xs text-gray-500"
                    title={token.address}
                  >
                    {formatAddress(token.address)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {isConnected && (
                    <span className="font-semibold text-primary">
                      {balance
                        ? `${balance.formatted} ${balance.symbol}`
                        : "-"}
                    </span>
                  )}
                  <button
                    onClick={() => onRemove(token.address)}
                    className="bg-error text-white text-sm py-1.5 px-4 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
