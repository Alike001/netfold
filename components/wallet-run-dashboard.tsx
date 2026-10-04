"use client";

import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, LoaderCircle, Plus } from "lucide-react";
import { useAccount } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { useWalletRuns } from "@/hooks/use-wallet-runs";
import { runStateLabel } from "@/lib/netfold-live";
import { formatUsdgBigint, truncateAddress } from "@/lib/utils";
import { WalletButton } from "@/components/wallet-button";

export function WalletRunDashboard() {
  const { address, chainId, isConnected } = useAccount();
  const runs = useWalletRuns(chainId === arbitrumSepolia.id ? address : undefined);

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-[#68717a]">Connected workspace</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Your runs and actions</h2></div>
        {isConnected && chainId === arbitrumSepolia.id
          ? <Link href={"/create" as Route} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-[#292d31]"><Plus size={16} /> Create clearing run</Link>
          : <WalletButton />}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold">Your runs</h3>
            <p className="mt-1 text-sm text-[#68717a]">{address ? `Runs created by ${truncateAddress(address)}` : "Runs created by your connected wallet"}</p>
            <div className="mt-4 space-y-2">
              {!isConnected && <p className="rounded-lg border border-dashed border-[#bfc5ca] bg-white p-5 text-sm text-[#68717a]">Connect a wallet to discover your onchain runs.</p>}
              {isConnected && chainId !== arbitrumSepolia.id && <p className="rounded-lg border border-[#e8cfac] bg-[#fff8ec] p-5 text-sm text-[#76501a]">Switch to Arbitrum Sepolia to load your runs.</p>}
              {runs.isLoading && <p className="flex items-center gap-2 rounded-lg border border-line bg-white p-5 text-sm"><LoaderCircle className="animate-spin" size={16} /> Reading creation events…</p>}
              {runs.isError && <p className="rounded-lg border border-[#efc5c3] bg-[#fff3f2] p-5 text-sm text-danger">Could not query live run events. Try again shortly.</p>}
              {runs.data?.created.length === 0 && <p className="rounded-lg border border-line bg-white p-5 text-sm text-[#68717a]">No runs created by this wallet yet.</p>}
              {runs.data?.created.map(({ runId, run }) => <Link key={runId.toString()} href={`/runs/${runId}` as Route} className="flex items-center justify-between rounded-lg border border-line bg-white p-5 hover:border-[#aeb8c1]"><div><p className="font-semibold">Run #{runId.toString()}</p><p className="mt-1 text-xs text-[#68717a]">{formatUsdgBigint(run.grossAmount)} USDG gross</p></div><div className="flex items-center gap-3"><span className="text-xs font-bold text-success">{runStateLabel(run.state)}</span><ArrowRight size={16} /></div></Link>)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Needs your attention</h3>
            <p className="mt-1 text-sm text-[#68717a]">Pending obligations rechecked against current contract state</p>
            <div className="mt-4 space-y-2">
              {!isConnected && <p className="rounded-lg border border-dashed border-[#bfc5ca] bg-white p-5 text-sm text-[#68717a]">Connect a wallet to find obligations awaiting your acceptance.</p>}
              {isConnected && chainId !== arbitrumSepolia.id && <p className="rounded-lg border border-[#e8cfac] bg-[#fff8ec] p-5 text-sm text-[#76501a]">Switch to Arbitrum Sepolia to load current obligations.</p>}
              {runs.isLoading && <p className="flex items-center gap-2 rounded-lg border border-line bg-white p-5 text-sm"><LoaderCircle className="animate-spin" size={16} /> Checking current obligations…</p>}
              {runs.data?.attention.length === 0 && <p className="rounded-lg border border-line bg-white p-5 text-sm text-[#68717a]">No pending obligations for this wallet.</p>}
              {runs.data?.attention.map(({ obligation }) => <Link key={obligation.id.toString()} href={`/runs/${obligation.runId}?obligation=${obligation.id}` as Route} className="flex items-center justify-between rounded-lg border border-[#e8cfac] bg-[#fffaf2] p-5 hover:border-[#d8aa68]"><div><p className="font-semibold">Accept obligation #{obligation.id.toString()}</p><p className="mt-1 text-sm text-[#76501a]">{formatUsdgBigint(obligation.amount)} USDG · Run #{obligation.runId.toString()}</p></div><ArrowRight size={16} /></Link>)}
            </div>
          </div>
      </div>
    </section>
  );
}
