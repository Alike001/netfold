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
        <div className="mx-auto max-w-[1440px] px-6 py-10 sm:py-14 lg:px-10 lg:py-16">
          <div className="flex flex-wrap gap-2"><Badge tone="success">Live on Arbitrum Sepolia</Badge><Badge>Canonical Paxos test USDG</Badge><Badge tone="success">Settled</Badge></div>
          <div className="mt-6 grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-5xl leading-[0.94] font-semibold tracking-[-0.065em] sm:text-7xl">Verify Run #001.</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#606971] sm:text-lg">The contract, asset, accounting, and settlement transaction are linked directly to committed Arbitrum Sepolia evidence.</p>
            </div>
            <div className="rounded-xl border border-[#cbd1d7] bg-white p-5 shadow-[0_18px_50px_rgba(22,34,48,0.08)] sm:p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-xs font-semibold tracking-[0.08em] text-[#737c84] uppercase">NetFold deployed address</dt><dd className="mt-1"><EvidenceLink value={d.deployment.contract} href={d.links.address(d.deployment.contract)} /></dd></div>
                <div><dt className="text-xs font-semibold tracking-[0.08em] text-[#737c84] uppercase">Paxos USDG address</dt><dd className="mt-1"><EvidenceLink value={d.deployment.token} href={d.links.address(d.deployment.token)} /></dd></div>
                <div className="sm:col-span-2"><dt className="text-xs font-semibold tracking-[0.08em] text-[#737c84] uppercase">Settlement transaction</dt><dd className="mt-1"><EvidenceLink value={d.run.settlementHash} href={d.links.tx(d.run.settlementHash)} kind="hash" /></dd></div>
              </dl>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-6">
            {[
              ["Chain", d.network.name, String(d.network.chainId)],
              ["Run", `#${String(d.run.id).padStart(3, "0")}`, null],
              ["Gross", `${d.display.gross} USDG`, null],
              ["Net liquidity", `${formatUsdg(d.run.totalDebit)} USDG`, null],
              ["Compression", d.display.compression, null],
              ["State", d.run.state, null],
            ].map(([label, value, detail]) => (
              <div key={label} className="min-w-0 bg-white p-3 sm:p-4">
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#737c84] uppercase">{label}</p>
                <p className="tabular mt-2 text-base leading-tight font-semibold tracking-[-0.03em] sm:text-lg">{value}</p>
                {detail && <p className="mt-1 font-mono text-[10px] text-[#737c84]">{detail}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-10 lg:py-20">
        <section>
          <p className="text-sm text-[#68717a]">Accounting reconciliation</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Every unit accounted for.</h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Total debit", `${formatUsdg(d.run.totalDebit)} USDG`], ["Total credit", `${formatUsdg(d.run.totalCredit)} USDG`],
            ["Coverage", `${formatUsdg(d.run.totalFunded)} USDG`], ["Accounted liability", `${formatUsdg(d.run.accountedLiability)} USDG`],
            ["Settlement block", d.run.settlementBlock.toLocaleString("en-US")], ["Verification", "Sourcify exact match"],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-5 sm:p-6"><p className="text-xs font-semibold tracking-[0.1em] text-[#737c84] uppercase">{label}</p><p className="tabular mt-4 text-xl font-semibold tracking-[-0.03em]">{value}</p></div>
          ))}
          </div>
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
