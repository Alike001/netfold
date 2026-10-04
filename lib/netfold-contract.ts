import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { netFoldAbi } from "@/lib/generated/netfold-clearing-abi";

export { netFoldAbi };

export const NETFOLD_CHAIN_ID = 421614;
export const NETFOLD_ADDRESS = "0x516479a53483b675Fe4629E3C63088c51cf6eFa7" as const;
export const USDG_ADDRESS = "0xFFC95faa3d63Cde504a05B567C600B78C0b41892" as const;
export const NETFOLD_DEPLOYMENT_BLOCK = 315465848n;
export const ARBISCAN_URL = "https://sepolia.arbiscan.io";
export const USDG_DECIMALS = 6;

export const livePublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(
    process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ??
      "https://sepolia-rollup.arbitrum.io/rpc",
  ),
});

export const contractLink = () => `${ARBISCAN_URL}/address/${NETFOLD_ADDRESS}`;
export const transactionLink = (hash: string) => `${ARBISCAN_URL}/tx/${hash}`;
