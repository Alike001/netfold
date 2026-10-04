"use client";

import { CheckCircle2, ExternalLink, LoaderCircle, TriangleAlert } from "lucide-react";
import type { Hash } from "viem";
import type { TransactionStage } from "@/hooks/use-netfold-write";
import { transactionLink } from "@/lib/netfold-contract";
import { truncateHash } from "@/lib/utils";

export function TransactionStatus({ stage, hash, error }: { stage: TransactionStage; hash?: Hash; error?: string }) {
  if (stage === "idle") return null;
  return (
    <div aria-live="polite" className="mt-3 rounded-md border border-line bg-[#f8f9f8] p-3 text-sm">
      {stage === "wallet" && <p className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={15} /> Confirm in your wallet…</p>}
      {stage === "confirming" && <p className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={15} /> Broadcast. Waiting for receipt…</p>}
      {stage === "confirmed" && <p className="flex items-center gap-2 text-success"><CheckCircle2 size={15} /> Confirmed on Arbitrum Sepolia.</p>}
      {stage === "error" && <p className="flex items-start gap-2 text-danger"><TriangleAlert className="mt-0.5 shrink-0" size={15} /> {error}</p>}
      {hash && <a className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-arb hover:underline" href={transactionLink(hash)} target="_blank" rel="noreferrer">{truncateHash(hash)} <ExternalLink size={11} /></a>}
    </div>
  );
}
