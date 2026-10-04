"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { parseEventLogs } from "viem";
import { useAccount } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { WalletButton } from "@/components/wallet-button";
import { Button } from "@/components/ui/button";
import { TransactionStatus } from "@/components/transaction-status";
import { useNetFoldWrite } from "@/hooks/use-netfold-write";
import { netFoldAbi } from "@/lib/netfold-contract";
import { validateDeadline, validateParticipants } from "@/lib/netfold-live";

function defaultDeadline() {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function CreateRunForm() {
  const router = useRouter();
  const { address, chainId, isConnected } = useAccount();
  const [participants, setParticipants] = useState(["", ""]);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [formError, setFormError] = useState<string>();
  const writer = useNetFoldWrite(async (receipt) => {
    const [created] = parseEventLogs({ abi: netFoldAbi, logs: receipt.logs, eventName: "RunCreated", strict: true });
    if (!created) throw new Error("RunCreated was not found in the confirmed receipt.");
    router.push(`/runs/${created.args.runId.toString()}?createdTx=${receipt.transactionHash}` as Route);
  });

  const displayedParticipants = useMemo(() => {
    if (!address || participants.some((item) => item.toLowerCase() === address.toLowerCase())) return participants;
    return [address, ...participants.filter(Boolean), ""].slice(0, Math.max(2, participants.length));
  }, [address, participants]);
  const creatorIncluded = useMemo(() => Boolean(address && displayedParticipants.some((item) => item.toLowerCase() === address.toLowerCase())), [address, displayedParticipants]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    const participantResult = validateParticipants(displayedParticipants);
    if (!participantResult.valid) return setFormError(participantResult.error);
    const timestamp = Math.floor(new Date(deadline).getTime() / 1000);
    const deadlineResult = validateDeadline(timestamp);
    if (!deadlineResult.valid) return setFormError(deadlineResult.error);
    try { await writer.execute("createRun", [participantResult.participants, deadlineResult.deadline]); } catch { /* status renders the decoded error */ }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:py-14">
      <p className="text-sm font-bold tracking-[0.12em] text-arb">ARBITRUM SEPOLIA</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Create a clearing run</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[#58616a]">Choose the participants and the deadline by which final net debtors must fully cover the run.</p>

      {(!isConnected || chainId !== arbitrumSepolia.id) ? (
        <div className="mt-8 rounded-xl border border-line bg-white p-7"><h2 className="text-xl font-semibold">Wallet required to create</h2><p className="mt-2 text-sm leading-6 text-[#68717a]">Connect an injected wallet and switch to Arbitrum Sepolia. No keys are handled by NetFold.</p><div className="mt-5"><WalletButton /></div></div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-7 rounded-xl border border-line bg-white p-6 sm:p-8">
          <fieldset>
            <div className="flex items-end justify-between gap-4"><div><legend className="font-semibold">Participants</legend><p className="mt-1 text-sm text-[#68717a]">2–8 unique addresses. Your connected creator wallet is included automatically.</p></div><span className="text-xs font-semibold text-[#68717a]">{displayedParticipants.length} / 8</span></div>
            <div className="mt-4 space-y-3">
              {displayedParticipants.map((participant, index) => (
                <div key={index} className="flex gap-2">
                  <label className="sr-only" htmlFor={`participant-${index}`}>Participant {index + 1}</label>
                  <input id={`participant-${index}`} value={participant} readOnly={participant.toLowerCase() === address?.toLowerCase()} onChange={(event) => setParticipants(displayedParticipants.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder="0x…" className="min-w-0 flex-1 rounded-md border border-line px-4 py-3 font-mono text-sm outline-none read-only:bg-[#f5f6f5] focus:border-arb focus:ring-2 focus:ring-arb/20" />
                  <Button type="button" variant="quiet" aria-label={`Remove participant ${index + 1}`} disabled={displayedParticipants.length <= 2 || participant.toLowerCase() === address?.toLowerCase()} onClick={() => setParticipants(displayedParticipants.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></Button>
                </div>
              ))}
            </div>
            {displayedParticipants.length < 8 && <Button type="button" variant="secondary" className="mt-3" onClick={() => setParticipants([...displayedParticipants, ""])}><Plus size={15} /> Add participant</Button>}
            {!creatorIncluded && <p className="mt-3 text-sm text-warning">Include the connected creator wallet to participate directly in the run.</p>}
          </fieldset>

          <div><label htmlFor="deadline" className="font-semibold">Funding deadline</label><div className="relative mt-2"><CalendarClock className="pointer-events-none absolute left-3 top-3.5 text-[#6f7780]" size={17} /><input id="deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="w-full rounded-md border border-line py-3 pl-10 pr-4 outline-none focus:border-arb focus:ring-2 focus:ring-arb/20" /></div><p className="mt-2 text-xs text-[#68717a]">Displayed in your local timezone; submitted as a Unix timestamp.</p></div>
          {formError && <p role="alert" className="rounded-md border border-[#efc5c3] bg-[#fff3f2] p-3 text-sm text-danger">{formError}</p>}
          <Button type="submit" disabled={writer.busy}>{writer.stage === "wallet" ? "Confirm in wallet…" : writer.stage === "confirming" ? "Waiting for receipt…" : "Create on Arbitrum Sepolia"}</Button>
          <TransactionStatus stage={writer.stage} hash={writer.hash} error={writer.error} />
        </form>
      )}
    </div>
  );
}
