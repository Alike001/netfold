"use client";

import { useQuery } from "@tanstack/react-query";
import { erc20Abi, type Address } from "viem";
import {
  livePublicClient,
  NETFOLD_ADDRESS,
  netFoldAbi,
  USDG_ADDRESS,
} from "@/lib/netfold-contract";
import type { LiveObligation, LivePosition, LiveRun } from "@/lib/netfold-live";

export function useLiveRun(runId: bigint, wallet?: Address) {
  return useQuery({
    queryKey: ["live-run", runId.toString(), wallet?.toLowerCase()],
    queryFn: async () => {
      const [runResult, participantsResult, idsResult] = await Promise.all([
        livePublicClient.readContract({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "getRun", args: [runId] }),
        livePublicClient.readContract({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "getParticipants", args: [runId] }),
        livePublicClient.readContract({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "getObligationIds", args: [runId] }),
      ]);
      const run = runResult as LiveRun;
      const participants = participantsResult as Address[];
      const ids = idsResult as bigint[];
      const obligationResults = ids.length
        ? await livePublicClient.multicall({
            contracts: ids.map((id) => ({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "getObligation" as const, args: [id] })),
            allowFailure: false,
          })
        : [];
      const obligations = obligationResults.map((item, index) => ({ id: ids[index], ...(item as Omit<LiveObligation, "id">) }));
      const positionResults = participants.length
        ? await livePublicClient.multicall({
            contracts: participants.map((participant) => ({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "getPosition" as const, args: [runId, participant] })),
            allowFailure: false,
          })
        : [];
      const positions = positionResults.map((item, index) => ({ participant: participants[index], ...(item as Omit<LivePosition, "participant">) }));
      const compressionBps = run.grossAmount > 0n
        ? await livePublicClient.readContract({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "compressionBps", args: [runId] })
        : 0n;

      let walletData: { requiredFunding: bigint; balance: bigint; allowance: bigint; position?: LivePosition } | undefined;
      if (wallet) {
        const [requiredFunding, balance, allowance] = await Promise.all([
          livePublicClient.readContract({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "requiredFunding", args: [runId, wallet] }).catch(() => 0n),
          livePublicClient.readContract({ address: USDG_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [wallet] }),
          livePublicClient.readContract({ address: USDG_ADDRESS, abi: erc20Abi, functionName: "allowance", args: [wallet, NETFOLD_ADDRESS] }),
        ]);
        walletData = {
          requiredFunding,
          balance,
          allowance,
          position: positions.find((position) => position.participant.toLowerCase() === wallet.toLowerCase()),
        };
      }
      return { run, participants, ids, obligations, positions, compressionBps, walletData };
    },
    enabled: runId > 0n,
    refetchInterval: 15_000,
    retry: 1,
  });
}

