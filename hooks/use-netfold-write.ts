"use client";

import { useCallback, useState } from "react";
import { type ContractFunctionArgs, type ContractFunctionName, type Hash, type TransactionReceipt } from "viem";
import { useWriteContract } from "wagmi";
import { livePublicClient, NETFOLD_ADDRESS, netFoldAbi } from "@/lib/netfold-contract";
import { formatTransactionError } from "@/lib/netfold-live";

export type TransactionStage = "idle" | "wallet" | "confirming" | "confirmed" | "error";

export function useNetFoldWrite(onConfirmed?: (receipt: TransactionReceipt) => void | Promise<void>) {
  const { writeContractAsync } = useWriteContract();
  const [stage, setStage] = useState<TransactionStage>("idle");
  const [hash, setHash] = useState<Hash>();
  const [error, setError] = useState<string>();

  const executeRequest = useCallback(async (request: Parameters<typeof writeContractAsync>[0]) => {
    setError(undefined);
    setHash(undefined);
    setStage("wallet");
    try {
      const transactionHash = await writeContractAsync(request);
      setHash(transactionHash);
      setStage("confirming");
      const receipt = await livePublicClient.waitForTransactionReceipt({ hash: transactionHash });
      if (receipt.status !== "success") throw new Error("The transaction was mined but reverted.");
      setStage("confirmed");
      await onConfirmed?.(receipt);
      return receipt;
    } catch (cause) {
      setError(formatTransactionError(cause));
      setStage("error");
      throw cause;
    }
  }, [onConfirmed, writeContractAsync]);

  const execute = useCallback(async <TName extends ContractFunctionName<typeof netFoldAbi, "nonpayable">>(
    functionName: TName,
    args: ContractFunctionArgs<typeof netFoldAbi, "nonpayable", TName>,
  ) => executeRequest({
    address: NETFOLD_ADDRESS,
    abi: netFoldAbi,
    functionName,
    args,
  } as Parameters<typeof writeContractAsync>[0]), [executeRequest]);

  const reset = useCallback(() => {
    setStage("idle");
    setHash(undefined);
    setError(undefined);
  }, []);

  return { execute, executeRequest, stage, hash, error, reset, busy: stage === "wallet" || stage === "confirming" };
}
