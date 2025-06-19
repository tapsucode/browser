
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Balance } from "../lib/types";

// Define context type
interface BalanceContextType {
  balance: Balance;
  updateBalance: (newBalance: Balance) => void;
}

// Create context with default values
const BalanceContext = createContext<BalanceContextType>({
  balance: { amount: 0, currency: "USD" },
  updateBalance: () => {}
});

// Provider component
export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<Balance>({
    amount: 100,
    currency: "USD"
  });

  const updateBalance = (newBalance: Balance) => {
    setBalance(newBalance);
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalanceContext() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
}
