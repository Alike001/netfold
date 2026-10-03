import { ArrowRight, CheckCircle2, ExternalLink, Landmark, Network, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ClearingVisualization } from "@/components/clearing-visualization";
import { EvidenceLink } from "@/components/evidence-link";
import { ProcessFlow } from "@/components/process-flow";
import { Badge } from "@/components/ui/badge";
import { netfoldData } from "@/lib/netfold-data";
import { formatUsdg } from "@/lib/utils";

export default function LandingPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <section className="page-grid border-b border-line">
        <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-[1440px] items-start gap-12 px-6 py-14 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-20">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">Live on Arbitrum Sepolia</Badge>
              <Badge>Canonical Paxos test USDG</Badge>
            </div>
            <h1 className="mt-6 max-w-4xl text-[clamp(3rem,6vw,6.8rem)] leading-[0.9] font-semibold tracking-[-0.075em]">
              Settle the difference, not every obligation.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#59636c] sm:text-xl">
              NetFold compresses mutually approved USDG obligations into fully covered net settlements on Arbitrum.
            </p>
            <div className="mt-7 grid max-w-2xl grid-cols-[1fr_auto_1fr_auto_1fr] items-center border-y border-[#ccd2d7] py-4">
              {[[netfoldData.display.gross, "USDG gross"], [netfoldData.display.liquidity, "USDG liquidity"], [netfoldData.display.compression, "compression"]].map(([value, label]) => (
                <div key={label} className="min-w-0 px-1 first:pl-0 sm:px-3">
                  <strong className="tabular block text-2xl tracking-[-0.05em] sm:text-3xl">{value}</strong>
                  <span className="mt-1 block text-[10px] leading-tight text-[#68717a] uppercase sm:text-xs">{label}</span>
                </div>
              )).flatMap((item, index) => index < 2 ? [item, <ArrowRight key={`arrow-${index}`} size={15} className="text-arb" />] : [item])}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/app" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white transition hover:bg-[#292d31]">
                Explore live settlement <ArrowRight size={16} />
              </Link>
              <Link href="/proof" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#c8cdd2] bg-white px-5 text-sm font-semibold text-ink transition hover:border-[#aeb5bc]">
                View proof <ExternalLink size={15} />
              </Link>
            </div>
          </div>
          <ClearingVisualization />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-28 lg:px-10 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="max-w-xl text-4xl leading-[1.02] font-semibold tracking-[-0.055em] sm:text-6xl">
              Three obligations. One net settlement.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#626b73]">
              Offset what each participant owes against what it receives—then move only the residual liquidity.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
            <div className="bg-white p-7 sm:p-9">
              <p className="text-xs font-bold tracking-[0.13em] text-[#6a737b] uppercase">Before clearing</p>
              <div className="mt-8 space-y-6">
                {netfoldData.obligations.map((item) => (
                  <div key={item.id} className="flex items-baseline justify-between gap-5">
                    <span className="text-[#5f6870]">{item.payer.name} owes {item.payee.name}</span>
                    <strong className="tabular text-2xl tracking-[-0.04em]">{formatUsdg(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-ink p-7 text-white sm:p-9">
              <p className="text-xs font-bold tracking-[0.13em] text-[#9ebdeb] uppercase">After offsetting</p>
              <div className="mt-8 space-y-6">
                {netfoldData.positions.map((item) => (
                  <div key={item.participant.name} className="flex items-baseline justify-between gap-5">
                    <span className="text-[#c2c8ce]">{item.participant.name} {item.direction === "PAY" ? "owes" : "receives"}</span>
                    <strong className="tabular text-2xl tracking-[-0.04em]">{formatUsdg(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-line bg-[#eef3f8]">
        <div className="flex min-w-max animate-none items-center justify-center gap-10 px-6 py-4 font-mono text-xs text-[#53606b] md:gap-20">
          <span>STUDIO → AUDITOR · 100 USDG</span><span>•</span><span>AUDITOR → INFRASTRUCTURE · 60 USDG</span><span>•</span><span>INFRASTRUCTURE → STUDIO · 40 USDG</span>
        </div>
      </div>

      <ProcessFlow />

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-28 lg:px-10 lg:py-40">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2"><Badge tone="success">Live on Arbitrum Sepolia</Badge><Badge>Canonical Paxos test USDG</Badge><Badge tone="success">Settled</Badge></div>
              <h2 className="mt-5 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-[-0.055em] sm:text-6xl">Run #001 is settled and independently inspectable.</h2>
            </div>
            <Link href="/proof" className="inline-flex items-center gap-2 font-semibold text-arb hover:underline">Inspect settlement proof <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-14 grid grid-flow-dense grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-12">
            <article className="group overflow-hidden bg-ink p-7 text-white md:col-span-6 md:row-span-1 sm:p-9">
              <Network className="text-[#75a9f5] transition-transform duration-700 ease-out group-hover:scale-105" />
              <p className="mt-12 text-sm text-[#aeb6be]">NetFold contract</p>
              <p className="mt-2"><EvidenceLink value={netfoldData.deployment.contract} href={netfoldData.links.address(netfoldData.deployment.contract)} tone="inverse" /></p>
              <p className="mt-5 text-sm text-[#aeb6be]">Canonical Paxos USDG</p>
              <p className="mt-2"><EvidenceLink value={netfoldData.deployment.token} href={netfoldData.links.address(netfoldData.deployment.token)} tone="inverse" /></p>
            </article>
            <article className="bg-[#f8fbff] p-7 md:col-span-3 sm:p-9"><p className="text-sm text-[#64707b]">Gross</p><strong className="tabular mt-8 block text-5xl tracking-[-0.065em]">{netfoldData.display.gross}</strong><span className="mt-2 block text-sm">USDG obligations</span></article>
            <article className="bg-[#f8fbff] p-7 md:col-span-3 sm:p-9"><p className="text-sm text-[#64707b]">Net liquidity</p><strong className="tabular mt-8 block text-5xl tracking-[-0.065em]">{netfoldData.display.liquidity}</strong><span className="mt-2 block text-sm">USDG required</span></article>
            <article className="bg-white p-7 md:col-span-4 sm:p-9"><Landmark className="text-arb" /><p className="mt-8 text-sm text-[#64707b]">Run</p><strong className="mt-2 block text-3xl tracking-[-0.04em]">#001</strong></article>
            <article className="bg-white p-7 md:col-span-4 sm:p-9"><ShieldCheck className="text-success" /><p className="mt-8 text-sm text-[#64707b]">Final state</p><strong className="mt-2 flex items-center gap-2 text-3xl tracking-[-0.04em] text-success"><CheckCircle2 size={24} /> {netfoldData.run.state}</strong></article>
            <article className="bg-arb-soft p-7 md:col-span-4 sm:p-9"><p className="text-sm text-[#4e6480]">Gross-to-net compression</p><strong className="tabular mt-8 block text-6xl tracking-[-0.07em] text-[#144f9f]">{netfoldData.display.compression}</strong></article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-28 lg:px-10 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold tracking-[0.13em] text-arb uppercase">Founder House roadmap</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Start with a run. Build toward a clearing layer.</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            <div className="py-6"><p className="font-semibold">Today</p><p className="mt-2 text-[#606971]">Manual, fully covered USDG clearing runs.</p></div>
            {["Accounting integrations", "DAO treasury integrations", "Marketplace settlement", "API-driven recurring clearing windows", "Machine-payment / x402 / MPP clearing"].map((item) => (
              <div key={item} className="flex items-center justify-between py-5"><span>{item}</span><ArrowRight size={15} className="text-[#9aa1a8]" /></div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-28 text-white lg:py-36">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <h2 className="max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.06em] sm:text-7xl">Follow the money, from obligation to final settlement.</h2>
          <Link href="/app" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md bg-white px-5 font-semibold text-ink">Open Run #001 <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
