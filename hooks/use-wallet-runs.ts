"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { livePublicClient, NETFOLD_ADDRESS, NETFOLD_DEPLOYMENT_BLOCK, netFoldAbi } from "@/lib/netfold-contract";
import { ObligationStatus, RunState, type LiveObligation, type LiveRun } from "@/lib/netfold-live";

export function useWalletRuns(wallet?: Address) {
  return useQuery({
    queryKey: ["wallet-runs", wallet?.toLowerCase()],
    enabled: Boolean(wallet),
    refetchInterval: 20_000,
    queryFn: async () => {
      if (!wallet) return { created: [], attention: [] };
      const [createdLogs, payerLogs] = await Promise.all([
        livePublicClient.getContractEvents({
          address: NETFOLD_ADDRESS,
          abi: netFoldAbi,
          eventName: "RunCreated",
          args: { creator: wallet },
          fromBlock: NETFOLD_DEPLOYMENT_BLOCK,
          toBlock: "latest",
        }),
        livePublicClient.getContractEvents({
          address: NETFOLD_ADDRESS,
          abi: netFoldAbi,
          eventName: "ObligationProposed",
          args: { payer: wallet },
          fromBlock: NETFOLD_DEPLOYMENT_BLOCK,
          toBlock: "latest",
        }),
      ]);

      const createdIds = [...new Set(createdLogs.map((log) => log.args.runId!).filter(Boolean))];
      const created = await Promise.all(createdIds.map(async (runId) => {
        const run = await livePublicClient.readContract({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "getRun", args: [runId] });
        return { runId, run: run as LiveRun };
      }));

      const proposed = await Promise.all(payerLogs.map(async (log) => {
        const obligationId = log.args.obligationId!;
        const obligation = await livePublicClient.readContract({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "getObligation", args: [obligationId] }) as Omit<LiveObligation, "id">;
        const run = await livePublicClient.readContract({ address: NETFOLD_ADDRESS, abi: netFoldAbi, functionName: "getRun", args: [obligation.runId] }) as LiveRun;
        return { obligation: { id: obligationId, ...obligation }, run };
      }));
      const attention = proposed.filter(({ obligation, run }) => obligation.status === ObligationStatus.Pending && run.state === RunState.Open);
      return { created, attention };
    },
  });
}

