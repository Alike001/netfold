import { ArrowRight, Check, ExternalLink, LockKeyhole, Plus } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import type { Metadata } from "next";
import { EvidenceLink } from "@/components/evidence-link";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { TestingHelp } from "@/components/testing-help";
import { WalletRunDashboard } from "@/components/wallet-run-dashboard";
import { netfoldData } from "@/lib/netfold-data";
import { formatUsdg } from "@/lib/utils";

export const metadata: Metadata = { title: "Business settlement workspace" };

export default function WorkspacePage() {
  return (
    <main className="min-h-screen bg-[#f2f3f1]">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-7 border-b border-[#ced2d5] pb-9 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-arb">Business settlement workspace</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">Settle the difference, not every obligation.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#68717a]">Create multi-counterparty USDG runs, collect debtor acceptance, fund final net positions, and settle on Arbitrum.</p>
          </div>
          <Link href={"/create" as Route} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-[#292d31]"><Plus size={16} /> Create clearing run</Link>
        </div>

        <ol aria-label="NetFold product lifecycle" className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-5">
          {["Record", "Accept", "Net", "Cover", "Settle"].map((step, index) => <li key={step} className="flex items-center gap-3 bg-white px-4 py-4"><span className="font-mono text-xs text-arb">0{index + 1}</span><span className="text-sm font-semibold">{step}</span></li>)}
        </ol>

        <WalletRunDashboard />
        <div className="mt-10"><TestingHelp /></div>

        <section className="mt-16 border-t border-[#ced2d5] pt-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge tone="success">{netfoldData.run.state}</Badge><Badge tone="blue">Live on Arbitrum Sepolia</Badge><Badge>Canonical Paxos test USDG</Badge></div><p className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-arb">Verified live example</p><h2 className="mt-2 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Clearing Run #001</h2></div><Link href={"/runs/1" as Route} className="inline-flex items-center gap-2 text-sm font-semibold text-arb hover:underline">Open live contract view <ArrowRight size={15} /></Link></div>
        </section>

        <section className="mt-8 grid gap-3 md:grid-cols-3">
          <MetricCard label="Gross obligations" value={netfoldData.display.gross} suffix="USDG" />
          <MetricCard label="Net liquidity" value={netfoldData.display.liquidity} suffix="USDG funded" />
          <MetricCard label="Gross-to-net compression" value={netfoldData.display.compression} suffix="200 USDG → 60 USDG" />
        </section>

        <div className="mt-12 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="min-w-0">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-[-0.035em]">Accepted obligations</h2><span className="text-sm text-[#68717a]">3 of 3 accepted</span></div>
            <div className="space-y-3">
              {netfoldData.obligations.map((item) => (
                <article key={item.id} className="group rounded-lg border border-line bg-white p-5 transition hover:border-[#b8c2ca] sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf3fb] text-sm font-bold text-arb">{item.id}</span>
                      <div className="min-w-0"><p className="flex items-center gap-2 font-semibold">{item.payer.name} <ArrowRight size={15} className="text-arb" /> {item.payee.name}</p><p className="mt-1 truncate font-mono text-xs text-[#7a838b]">{item.referenceHash}</p></div>
                    </div>
                    <div className="flex items-center justify-between gap-5 sm:justify-end"><strong className="tabular text-2xl tracking-[-0.04em]">{formatUsdg(item.amount)} USDG</strong><Badge tone="success">Accepted</Badge></div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-4 border-t border-line pt-4 text-xs">
                    <a href={netfoldData.links.tx(item.proposalHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-arb hover:underline">Proposal tx <ExternalLink size={11} /></a>
                    <a href={netfoldData.links.tx(item.acceptanceHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-arb hover:underline">Acceptance tx <ExternalLink size={11} /></a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="min-w-0">
            <h2 className="mb-5 text-2xl font-semibold tracking-[-0.035em]">Net positions</h2>
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              {netfoldData.positions.map((position) => (
                <div key={position.participant.name} className="flex items-center justify-between gap-5 border-b border-line p-5 last:border-b-0 sm:p-6">
                  <div><p className="font-semibold">{position.participant.name}</p><p className="mt-1 font-mono text-xs text-[#7a838b]">{position.participant.address.slice(0, 10)}…</p></div>
                  <div className="text-right"><Badge tone={position.direction === "PAY" ? "blue" : "success"}>{position.direction}</Badge><strong className="tabular mt-2 block text-2xl tracking-[-0.04em]">{formatUsdg(position.amount)} USDG</strong></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#c6d9ef] bg-arb-soft p-4 text-sm leading-6 text-[#385371]"><LockKeyhole className="mt-1 shrink-0 text-arb" size={17} /><p>Settlement released only after the full <strong>60 USDG</strong> net debit was covered.</p></div>
          </section>
        </div>

        <section className="mt-14 rounded-xl border border-line bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-[#68717a]">Irreversible onchain lifecycle</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">From created to settled</h2></div><EvidenceLink value={netfoldData.run.settlementHash} href={netfoldData.links.tx(netfoldData.run.settlementHash)} kind="hash" /></div>
          <ol className="mt-8 grid gap-2 lg:grid-cols-5">
            {netfoldData.lifecycle.map((step, index) => {
              const hash = "hash" in step ? step.hash : step.hashes[0];
              return (
                <li key={step.label} className="relative rounded-md border border-[#c6dfd2] bg-success-soft p-4">
                  <div className="flex items-center justify-between"><span className="grid size-6 place-items-center rounded-full bg-success text-white"><Check size={13} /></span><span className="font-mono text-[10px] text-[#5b7065]">0{index + 1}</span></div>
                  <p className="mt-6 text-sm font-bold tracking-[0.09em] text-success">{step.label}</p>
                  <a href={netfoldData.links.tx(hash)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-[#50635a] hover:underline">Evidence <ExternalLink size={10} /></a>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}
