"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SendTransactionCardProps {
  isConnected: boolean;
  isLoading: boolean;
  onSend: (to: string, amount: string) => Promise<void>;
}

export function SendTransactionCard({
  isConnected,
  isLoading,
  onSend,
}: SendTransactionCardProps) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !amount) return;
    await onSend(to, amount);
    setTo("");
    setAmount("");
  };

  if (!isConnected) return null;

  return (
    <div className="bg-white rounded-2xl p-6 mb-5 shadow-card">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Send ETH</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient Address (0x...)"
          className={cn(
            "w-full p-3 border-2 border-gray-200 rounded-lg mb-3",
            "text-sm font-sans",
            "focus:outline-none focus:border-primary",
            "placeholder:text-gray-400"
          )}
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (ETH)"
          step="0.0001"
          className={cn(
            "w-full p-3 border-2 border-gray-200 rounded-lg mb-4",
            "text-sm font-sans",
            "focus:outline-none focus:border-primary",
            "placeholder:text-gray-400"
          )}
        />
        <button
          type="submit"
          disabled={!to || !amount || isLoading}
          className={cn(
            "w-full py-3.5 px-6 rounded-lg font-semibold transition-all",
            "bg-gradient-to-r from-primary to-primary-dark text-white",
            "hover:-translate-y-0.5 hover:shadow-button",
            "disabled:translate-none disabled:shadow-none disabled:bg-gray-400 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? "Sending..." : "Send Transaction"}
        </button>
      </form>
    </div>
  );
}
