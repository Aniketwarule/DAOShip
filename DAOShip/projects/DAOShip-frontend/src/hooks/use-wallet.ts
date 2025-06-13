import { useState, useEffect } from "react";

interface WalletHook {
  isConnected: boolean;
  walletAddress: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWallet = (): WalletHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const connect = async () => {
    try {
      // TODO: Implement actual wallet connection logic
      setIsConnected(true);
      setWalletAddress("0x..."); // Placeholder
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
  };

  return {
    isConnected,
    walletAddress,
    connect,
    disconnect,
  };
};
