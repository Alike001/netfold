import { CheckCircle2, ExternalLink, FileCheck2 } from "lucide-react";
import type { Metadata } from "next";
import { EvidenceLink } from "@/components/evidence-link";
import { Badge } from "@/components/ui/badge";
import { netfoldData } from "@/lib/netfold-data";
import { formatUsdg } from "@/lib/utils";

export const metadata: Metadata = { title: "Live settlement proof" };

export default function ProofPage() {
  const d = netfoldData;
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-10 lg:py-28">
          <Badge tone="success">Live Arbitrum Sepolia evidence</Badge>
          <h1 className="mt-6 max-w-5xl text-5xl leading-[0.98] font-semibold tracking-[-0.065em] sm:text-7xl">One settlement, independently verifiable from end to end.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#606971]">Every value below is derived from committed deployment receipts and historical USDG balance reads for Run #001.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10 lg:py-24">
        <section className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Network", d.network.name], ["Chain ID", String(d.network.chainId)], ["Run", `#${String(d.run.id).padStart(3, "0")}`], ["Final state", d.run.state],
            ["Gross amount", `${d.display.gross} USDG`], ["Total debit", `${formatUsdg(d.run.totalDebit)} USDG`], ["Total credit", `${formatUsdg(d.run.totalCredit)} USDG`], ["Compression", d.display.compression],
            ["Coverage", `${formatUsdg(d.run.totalFunded)} USDG`], ["Accounted liability", `${formatUsdg(d.run.accountedLiability)} USDG`], ["Settlement block", d.run.settlementBlock.toLocaleString("en-US")], ["Verification", "Sourcify exact match"],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-5 sm:p-6"><p className="text-xs font-semibold tracking-[0.1em] text-[#737c84] uppercase">{label}</p><p className="tabular mt-4 text-xl font-semibold tracking-[-0.03em]">{value}</p></div>
          ))}
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-line p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.035em]">Deployment</h2>
            <dl className="mt-7 space-y-6">
              <div><dt className="text-sm text-[#68717a]">NetFold contract</dt><dd className="mt-2"><EvidenceLink value={d.deployment.contract} href={d.links.address(d.deployment.contract)} /></dd></div>
              <div><dt className="text-sm text-[#68717a]">Canonical Paxos USDG</dt><dd className="mt-2"><EvidenceLink value={d.deployment.token} href={d.links.address(d.deployment.token)} /></dd></div>
              <div><dt className="text-sm text-[#68717a]">Deployment transaction</dt><dd className="mt-2"><EvidenceLink value={d.deployment.transactionHash} href={d.links.tx(d.deployment.transactionHash)} kind="hash" /></dd></div>
              <div><dt className="text-sm text-[#68717a]">Source verification</dt><dd className="mt-2"><a href={d.deployment.verificationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-arb hover:underline"><FileCheck2 size={15} /> Exact creation and runtime match <ExternalLink size={12} /></a></dd></div>
            </dl>
          </div>
          <div className="rounded-xl border border-line p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.035em]">Participants & obligations</h2>
            <div className="mt-7 space-y-5">
              {d.obligations.map((item) => (
                <div key={item.id} className="flex flex-col justify-between gap-3 border-b border-line pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-center">
                  <div><p className="font-semibold">#{item.id} · {item.payer.name} → {item.payee.name}</p><p className="mt-1 font-mono text-xs text-[#747d85]">{item.referenceHash.slice(0, 18)}…</p></div>
                  <div className="text-left sm:text-right"><strong className="tabular text-xl">{formatUsdg(item.amount)} USDG</strong><a href={d.links.tx(item.proposalHash)} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-arb hover:underline">Proposal transaction</a></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-end justify-between"><div><p className="text-sm text-[#68717a]">Six-decimal canonical USDG</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Balance movement</h2></div><Badge tone="success"><CheckCircle2 size={13} className="mr-1" /> Reconciled</Badge></div>
          <div className="mt-6 overflow-x-auto rounded-xl border border-line">
            <div className="balance-row min-w-[620px] border-b border-line bg-[#f5f6f5] px-5 py-3 text-xs font-bold tracking-[0.08em] text-[#68717a] uppercase"><span>Account</span><span className="text-right">Before funding</span><span className="text-right">Before settlement</span><span className="text-right">After settlement</span></div>
            {d.balances.map((row) => (
              <div key={row.name} className="balance-row min-w-[620px] border-b border-line px-5 py-5 last:border-b-0"><strong>{row.name}</strong><span className="text-right font-mono text-sm">{formatUsdg(row.beforeFunding)}</span><span className="text-right font-mono text-sm">{formatUsdg(row.beforeSettlement)}</span><span className="text-right font-mono text-sm text-success">{formatUsdg(row.afterSettlement)}</span></div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-xl bg-ink p-6 text-white sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm text-[#aeb6be]">Final settlement transaction</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">60 USDG funded. 60 USDG released. Zero liability remains.</h2></div><EvidenceLink value={d.run.settlementHash} href={d.links.tx(d.run.settlementHash)} kind="hash" tone="inverse" /></div>
        </section>
      </div>
    </main>
  );
}
