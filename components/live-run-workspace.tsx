"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy, ExternalLink, FilePlus2, LoaderCircle, ShieldAlert, X } from "lucide-react";
import { erc20Abi, getAddress, isAddress, parseEventLogs } from "viem";
import { useAccount } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionStatus } from "@/components/transaction-status";
import { WalletButton } from "@/components/wallet-button";
import { useLiveRun } from "@/hooks/use-live-run";
import { useNetFoldWrite } from "@/hooks/use-netfold-write";
import { NETFOLD_ADDRESS, netFoldAbi, transactionLink, USDG_ADDRESS } from "@/lib/netfold-contract";
import { canAcceptObligation, deriveRunActions, hashReference, invitationPath, ObligationStatus, obligationStatusLabel, parseUsdgAmount, RunState, runStateLabel } from "@/lib/netfold-live";
import { formatUsdgBigint, truncateAddress } from "@/lib/utils";

function referenceStorageKey(runId: bigint, obligationId: bigint) {
  return `netfold.reference.421614.${NETFOLD_ADDRESS.toLowerCase()}.${runId}.${obligationId}`;
}

function statusTone(state: number): "success" | "blue" | "warning" | "neutral" {
  if ([RunState.Covered, RunState.Settled].includes(state)) return "success";
  if (state === RunState.Open) return "blue";
  if (state === RunState.Closed || state === RunState.Expired) return "warning";
  return "neutral";
}

export function LiveRunWorkspace({ runId }: { runId: bigint }) {
  const searchParams = useSearchParams();
  const focusedObligation = searchParams.get("obligation");
  const creationHash = searchParams.get("createdTx");
  const { address, chainId, isConnected } = useAccount();
  const live = useLiveRun(runId, address);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [referenceLabels, setReferenceLabels] = useState<Record<string, string>>({});
  const [payer, setPayer] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [formError, setFormError] = useState<string>();
  const [copiedObligation, setCopiedObligation] = useState<string>();
  const pendingReference = useRef<string | undefined>(undefined);
  const writer = useNetFoldWrite(async (receipt) => {
    const savedReference = pendingReference.current;
    if (savedReference) {
      const logs = parseEventLogs({ abi: netFoldAbi, logs: receipt.logs, eventName: "ObligationProposed", strict: true });
      const event = logs[0];
      if (event) localStorage.setItem(referenceStorageKey(runId, event.args.obligationId), savedReference);
      pendingReference.current = undefined;
      setAmount(""); setReference("");
    }
    await live.refetch();
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!live.data) return;
    const labels: Record<string, string> = {};
    for (const obligation of live.data.obligations) {
      const label = localStorage.getItem(referenceStorageKey(runId, obligation.id));
      if (label) labels[obligation.id.toString()] = label;
    }
    const timer = window.setTimeout(() => setReferenceLabels(labels), 0);
    return () => window.clearTimeout(timer);
  }, [live.data, runId]);

  useEffect(() => {
    if (!focusedObligation || live.isLoading) return;
    document.getElementById(`obligation-${focusedObligation}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedObligation, live.isLoading]);

  const actions = useMemo(() => live.data ? deriveRunActions({
    wallet: address,
    correctChain: chainId === arbitrumSepolia.id,
    now,
    run: live.data.run,
    obligations: live.data.obligations,
    requiredFunding: live.data.walletData?.requiredFunding,
    allowance: live.data.walletData?.allowance,
    funded: live.data.walletData?.position?.funded,
    refunded: live.data.walletData?.position?.refunded,
  }) : undefined, [address, chainId, live.data, now]);

  if (live.isLoading) return <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-5"><LoaderCircle className="animate-spin text-arb" /><span className="ml-3">Reading Run #{runId.toString()} from Arbitrum Sepolia…</span></div>;
  if (live.isError || !live.data) return <div className="mx-auto max-w-2xl px-5 py-20 text-center"><ShieldAlert className="mx-auto text-danger" /><h1 className="mt-4 text-3xl font-semibold">Run not available</h1><p className="mt-3 text-[#68717a]">The contract rejected this run ID or the public RPC could not answer. No local fallback state is shown.</p><Button className="mt-6" onClick={() => live.refetch()}>Retry live read</Button></div>;

  const { run, obligations, positions, walletData, compressionBps } = live.data;
  const correctChain = chainId === arbitrumSepolia.id;
  const activeObligations = obligations.filter((item) => item.status !== ObligationStatus.Cancelled);
  const allAccepted = activeObligations.length > 0 && activeObligations.every((item) => item.status === ObligationStatus.Accepted);
  const shortfall = run.totalNetDebit > run.totalFunded ? run.totalNetDebit - run.totalFunded : 0n;
  const previewHash = reference.trim() ? hashReference(reference) : undefined;

  async function propose(event: React.FormEvent) {
    event.preventDefault(); setFormError(undefined);
    if (!isAddress(payer) || !isAddress(payee)) return setFormError("Payer and payee must be valid EVM addresses.");
    if (payer.toLowerCase() === payee.toLowerCase()) return setFormError("Payer and payee must be different.");
    if (![payer, payee].every((candidate) => run.participants.some((participant) => participant.toLowerCase() === candidate.toLowerCase()))) return setFormError("Payer and payee must both be participants in this run.");
    try {
      const parsedAmount = parseUsdgAmount(amount); const referenceHash = hashReference(reference);
      pendingReference.current = reference.trim();
      await writer.execute("proposeObligation", [runId, getAddress(payer), getAddress(payee), parsedAmount, referenceHash]);
    } catch (cause) { if (cause instanceof Error && writer.stage === "idle") setFormError(cause.message); }
  }

  async function execute(name: Parameters<typeof writer.execute>[0], args: unknown[]) {
    try { await writer.execute(name, args as never); } catch { /* rendered below */ }
  }

  async function copyInvitation(obligationId: bigint) {
    await navigator.clipboard.writeText(`${window.location.origin}${invitationPath(runId, obligationId)}`);
    setCopiedObligation(obligationId.toString());
    window.setTimeout(() => setCopiedObligation(undefined), 2_000);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10 lg:py-14">
      <header className="flex flex-col gap-6 border-b border-[#ced2d5] pb-8 md:flex-row md:items-end md:justify-between">
        <div><div className="flex flex-wrap gap-2"><Badge tone={statusTone(run.state)}>{runStateLabel(run.state)}</Badge><Badge tone="blue">Live on Arbitrum Sepolia</Badge></div><h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">Run #{runId.toString()}</h1><p className="mt-3 text-sm text-[#68717a]">Created by <span className="font-mono text-ink">{truncateAddress(run.creator, 10, 6)}</span></p></div>
        {!isConnected || !correctChain ? <WalletButton /> : <div className="text-right text-sm"><p className="text-[#68717a]">Connected role</p><p className="mt-1 font-semibold">{actions?.isCreator ? "Creator" : run.participants.some((item) => item.toLowerCase() === address?.toLowerCase()) ? "Participant" : "Observer"}</p></div>}
      </header>

      {creationHash?.startsWith("0x") && <div className="mt-6 rounded-lg border border-[#c6dfd2] bg-success-soft p-4 text-sm text-[#315f4b]"><strong>Run creation confirmed.</strong> <a href={transactionLink(creationHash)} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-1 text-arb hover:underline">View transaction <ExternalLink size={12} /></a></div>}

      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[['Gross obligations', formatUsdgBigint(run.grossAmount), 'USDG'], ['Net debit', formatUsdgBigint(run.totalNetDebit), 'USDG'], ['Total funded', formatUsdgBigint(run.totalFunded), 'USDG'], ['Compression', `${Number(compressionBps) / 100}%`, 'gross-to-net']].map(([label, value, suffix]) => <div key={label} className="rounded-lg border border-line bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#68717a]">{label}</p><p className="tabular mt-4 text-3xl font-semibold tracking-[-0.05em]">{value}</p><p className="mt-1 text-xs text-[#68717a]">{suffix}</p></div>)}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="flex items-end justify-between"><div><h2 className="text-2xl font-semibold">Obligations</h2><p className="mt-1 text-sm text-[#68717a]">{activeObligations.filter((item) => item.status === ObligationStatus.Accepted).length} of {activeObligations.length} active accepted</p></div><span className="text-xs text-[#68717a]">Maximum 32</span></div>
          <div className="mt-4 space-y-3">
            {obligations.length === 0 && <div className="rounded-lg border border-dashed border-[#bfc5ca] bg-white p-7 text-center text-sm text-[#68717a]">No obligations proposed yet.</div>}
            {obligations.map((obligation) => {
              const isPayer = address?.toLowerCase() === obligation.payer.toLowerCase();
              const canAccept = canAcceptObligation({ wallet: address, correctChain, runState: run.state, fundingDeadline: run.fundingDeadline, now, payer: obligation.payer, status: obligation.status });
              const pending = obligation.status === ObligationStatus.Pending;
              const highlighted = focusedObligation === obligation.id.toString();
              return <article id={`obligation-${obligation.id}`} tabIndex={highlighted ? -1 : undefined} key={obligation.id.toString()} className={`rounded-lg border bg-white p-5 outline-none transition ${highlighted ? "border-arb ring-2 ring-arb/20" : "border-line"}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-arb-soft text-xs font-bold text-arb">{obligation.id.toString()}</span><Badge tone={obligation.status === ObligationStatus.Accepted ? "success" : pending ? "warning" : "neutral"}>{obligationStatusLabel(obligation.status)}</Badge></div><p className="mt-4 font-mono text-xs text-[#68717a]">{truncateAddress(obligation.payer, 10, 6)} → {truncateAddress(obligation.payee, 10, 6)}</p><p className="tabular mt-2 text-2xl font-semibold">{formatUsdgBigint(obligation.amount)} USDG</p></div><div className="flex flex-wrap gap-2">{pending && <Button type="button" variant="secondary" onClick={() => copyInvitation(obligation.id)}>{copiedObligation === obligation.id.toString() ? <Check size={14} /> : <Copy size={14} />} {copiedObligation === obligation.id.toString() ? "Link copied" : "Copy acceptance link"}</Button>}{actions?.canMutateObligations && pending && <Button type="button" variant="quiet" disabled={writer.busy} onClick={() => execute("cancelObligation", [runId, obligation.id])}><X size={14} /> Cancel</Button>}</div></div>
                <div className="mt-4 border-t border-line pt-4"><p className="break-all font-mono text-xs text-[#68717a]">Reference hash: {obligation.referenceHash}</p>{referenceLabels[obligation.id.toString()] && <p className="mt-2 text-xs"><strong>Local label:</strong> {referenceLabels[obligation.id.toString()]} <span className="text-[#68717a]">(not stored onchain)</span></p>}</div>
                {pending && !isPayer && <p className="mt-4 rounded-md bg-[#f5f6f5] p-3 text-xs text-[#68717a]">Acceptance requires payer {obligation.payer}.</p>}
                {canAccept && <Button className="mt-4" disabled={writer.busy} onClick={() => execute("acceptObligation", [runId, obligation.id])}><Check size={15} /> Accept obligation</Button>}
              </article>;
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-line bg-white p-6"><h2 className="text-xl font-semibold">Run controls</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-[#68717a]">Funding deadline</dt><dd className="text-right font-medium">{new Date(Number(run.fundingDeadline) * 1000).toLocaleString()}</dd></div><div className="flex justify-between"><dt className="text-[#68717a]">Shortfall</dt><dd className="tabular font-medium">{formatUsdgBigint(shortfall)} USDG</dd></div></dl>
            {actions?.canClose && <div className="mt-5 rounded-md bg-arb-soft p-4 text-sm text-[#385371]"><p>All active obligations are accepted. Closing freezes the batch and computes final positions.</p><Button className="mt-4" disabled={writer.busy} onClick={() => execute("closeRun", [runId])}>Close and finalize</Button></div>}
            {actions?.isCreator && run.state === RunState.Open && !allAccepted && <p className="mt-5 rounded-md bg-[#fff8ec] p-4 text-sm text-[#76501a]">Every active obligation must be accepted before closing.</p>}
            {actions?.canCancelRun && <Button variant="quiet" className="mt-4 text-danger" disabled={writer.busy} onClick={() => execute("cancelRun", [runId])}>Cancel open run</Button>}
            {actions?.canExpire && <Button className="mt-5" disabled={writer.busy} onClick={() => execute("expireRun", [runId])}>Expire unfunded run</Button>}
            {actions?.canRefund && <Button className="mt-5" disabled={writer.busy} onClick={() => execute("claimRefund", [runId])}>Claim {formatUsdgBigint(actions.refundable)} USDG refund</Button>}
            {actions?.canSettle && <div className="mt-5 rounded-md bg-success-soft p-4 text-sm text-[#315f4b]"><p><strong>Fully covered.</strong> Total funded equals total net debit; any connected wallet may settle.</p><Button className="mt-4" disabled={writer.busy} onClick={() => execute("settleRun", [runId])}>Settle run</Button></div>}
            <TransactionStatus stage={writer.stage} hash={writer.hash} error={writer.error} />
          </section>

          {actions?.canPropose && <form onSubmit={propose} className="rounded-xl border border-line bg-white p-6"><div className="flex items-center gap-2"><FilePlus2 size={17} className="text-arb" /><h2 className="text-xl font-semibold">Propose obligation</h2></div><div className="mt-5 space-y-4">{[['Payer', payer, setPayer], ['Payee', payee, setPayee]].map(([label, value, setter]) => <label key={label as string} className="block text-sm font-medium">{label as string}<select value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="mt-2 w-full rounded-md border border-line bg-white p-3 font-mono text-xs"><option value="">Select participant</option>{run.participants.map((participant) => <option key={participant} value={participant}>{participant}</option>)}</select></label>)}<label className="block text-sm font-medium">Amount in USDG<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="100.00" className="mt-2 w-full rounded-md border border-line p-3" /></label><label className="block text-sm font-medium">Human reference<input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="INV-2026-001" className="mt-2 w-full rounded-md border border-line p-3" /></label>{previewHash && <div className="rounded-md bg-[#f5f6f5] p-3"><p className="text-xs text-[#68717a]">Preview: plaintext stays local; only this hash is stored.</p><p className="mt-2 break-all font-mono text-[11px]">{previewHash}</p></div>}{formError && <p className="text-sm text-danger">{formError}</p>}<Button type="submit" disabled={writer.busy}>Propose onchain</Button></div></form>}
        </aside>
      </section>

      {run.state >= RunState.Closed && run.state <= RunState.Refunded && <section className="mt-10 rounded-xl border border-line bg-white p-6 sm:p-8"><h2 className="text-2xl font-semibold">Finalized net positions</h2><div className="mt-6 grid gap-3 lg:grid-cols-3">{positions.map((position) => <div key={position.participant} className="rounded-lg border border-line p-5"><p className="font-mono text-xs text-[#68717a]">{truncateAddress(position.participant, 10, 6)}</p><p className={`tabular mt-4 text-2xl font-semibold ${position.netDebit > 0n ? "text-arb" : "text-success"}`}>{position.netDebit > 0n ? `PAY ${formatUsdgBigint(position.netDebit)}` : position.netCredit > 0n ? `RECEIVE ${formatUsdgBigint(position.netCredit)}` : "FLAT 0"} USDG</p><p className="mt-2 text-xs text-[#68717a]">Funded {formatUsdgBigint(position.funded)} · Refunded {formatUsdgBigint(position.refunded)}</p></div>)}</div></section>}

      {walletData && run.state === RunState.Closed && walletData.requiredFunding > 0n && correctChain && <section className="mt-6 rounded-xl border border-[#c6d9ef] bg-arb-soft p-6 sm:p-8"><h2 className="text-2xl font-semibold">Your exact funding requirement</h2><p className="tabular mt-3 text-4xl font-semibold text-arb">{formatUsdgBigint(walletData.requiredFunding)} USDG</p><div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><p>Balance: <strong>{formatUsdgBigint(walletData.balance)} USDG</strong></p><p>Allowance: <strong>{formatUsdgBigint(walletData.allowance)} USDG</strong></p></div>{walletData.balance < walletData.requiredFunding && <p className="mt-4 text-sm text-danger">Insufficient canonical test USDG balance.</p>}<div className="mt-5 flex flex-wrap gap-3">{actions?.canApprove && <Button disabled={writer.busy} onClick={async () => { try { await writer.executeRequest({ address: USDG_ADDRESS, abi: erc20Abi, functionName: "approve", args: [NETFOLD_ADDRESS, walletData.requiredFunding] }); } catch { /* rendered */ } }}>Approve exactly {formatUsdgBigint(walletData.requiredFunding)} USDG</Button>}{actions?.canFund && <Button disabled={writer.busy || walletData.balance < walletData.requiredFunding} onClick={() => execute("fund", [runId])}>Fund {formatUsdgBigint(walletData.requiredFunding)} USDG</Button>}</div><TransactionStatus stage={writer.stage} hash={writer.hash} error={writer.error} /></section>}

      <section className="mt-8 rounded-lg border border-line bg-white p-5 text-sm text-[#68717a]"><p><strong className="text-ink">Participants:</strong> {run.participants.length}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{run.participants.map((participant) => <span key={participant} className="font-mono text-xs">{truncateAddress(participant, 10, 6)}</span>)}</div>{writer.hash && <a href={transactionLink(writer.hash)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-arb hover:underline">Latest transaction <ExternalLink size={12} /></a>}</section>
    </div>
  );
}
