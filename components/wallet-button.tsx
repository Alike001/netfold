"use client";

import { Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";

export function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const connector = connectors[0];

  if (isConnected && chainId !== arbitrumSepolia.id) {
    return (
      <Button
        type="button"
        variant="secondary"
        onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
        disabled={isSwitching}
      >
        <Wallet size={15} />
        {isSwitching ? "Switching…" : "Switch network"}
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <Button type="button" variant="secondary" onClick={() => disconnect()} title="Disconnect wallet">
        <span className="size-2 rounded-full bg-success" />
        {truncateAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      disabled={!connector || isConnecting}
      onClick={() => connector && connect({ connector })}
      title={connector ? "Connect an injected wallet" : "No injected wallet detected"}
    >
      <Wallet size={15} />
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
