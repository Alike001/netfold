import { Ban, CheckCircle2, ExternalLink, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { netfoldData } from "@/lib/netfold-data";

export const metadata: Metadata = { title: "Settlement security" };

const attackCases = [
  "Unauthorized acceptance",
  "Self obligation",
  "Duplicate reference",
  "Mutation after close",
  "Funding by non-debtor",
  "Settlement before coverage",
  "Double settlement",
  "Premature refund",
  "Double refund",
] as const;

export default function BreakPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f2]">
      <section className="border-b border-line bg-ink text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-10 lg:py-28">
          <p className="text-sm font-bold tracking-[0.13em] text-[#75a9f5] uppercase">Failure evidence</p>
          <h1 className="mt-6 max-w-5xl text-5xl leading-[0.98] font-semibold tracking-[-0.065em] sm:text-7xl">Try to break the settlement.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#b8c0c7]">Two failure paths are reproducible against live Arbitrum state. The broader attack surface is exercised by the Foundry suite.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10 lg:py-24">
        <section className="grid gap-5 lg:grid-cols-2">
          {netfoldData.failures.map((failure, index) => (
            <article key={failure.title} className="overflow-hidden rounded-xl border border-[#e1b9b6] bg-white">
              <div className="flex items-center justify-between border-b border-[#efd2d0] bg-[#fff4f3] px-6 py-4"><Badge tone="danger">Live Arbitrum eth_call</Badge><Ban size={19} className="text-danger" /></div>
              <div className="p-6 sm:p-8"><p className="text-sm text-[#747d85]">{index === 0 ? "Before coverage" : "After final settlement"}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">{failure.title}</h2><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-md bg-[#f6f6f4] p-4"><span className="text-xs text-[#737c84]">Expected</span><strong className="mt-2 block text-danger">BLOCKED</strong></div><div className="rounded-md bg-[#f6f6f4] p-4"><span className="text-xs text-[#737c84]">Actual</span><strong className="mt-2 block">InvalidRunState</strong></div></div><div className="mt-6 rounded-md bg-ink p-4 font-mono text-xs leading-6 text-[#c5cbd1]"><p>selector {failure.selector}</p><p className="mt-1 truncate" title={failure.revertData}>{failure.revertData}</p></div><p className="mt-5 text-sm leading-6 text-[#68717a]">{failure.evidence}</p></div>
            </article>
          ))}
        </section>

        <section className="mt-20">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div><Badge tone="blue">Foundry tests · not live transactions</Badge><h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Test-suite attack cases</h2><p className="mt-6 text-lg leading-8 text-[#616a72]">These checks support engineering confidence. They are not a security audit.</p></div>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
              {attackCases.map((item) => <div key={item} className="flex items-center gap-3 bg-white p-5"><CheckCircle2 size={17} className="shrink-0 text-success" /><span className="font-medium">{item}</span></div>)}
              <a href="https://github.com/foundry-rs/foundry" target="_blank" rel="noreferrer" className="flex items-center justify-between bg-[#edf3fb] p-5 font-medium text-arb">Foundry methodology <ExternalLink size={14} /></a>
            </div>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["40", "passing tests"], ["0", "failures"], ["3 × 256", "fuzz campaign runs"], ["5 × 128 × 64", "invariant runs × calls"]].map(([value, label]) => <div key={label} className="rounded-lg border border-line bg-white p-6"><strong className="tabular text-4xl tracking-[-0.055em]">{value}</strong><span className="mt-2 block text-sm text-[#68717a]">{label}</span></div>)}
          </div>
        </section>

        <section className="mt-20 rounded-xl border border-[#ecd4a9] bg-[#fff9ee] p-7 sm:p-9"><div className="flex items-start gap-4"><ShieldAlert className="mt-1 shrink-0 text-warning" /><div><h2 className="text-xl font-semibold">Explicit limits</h2><p className="mt-3 max-w-4xl leading-7 text-[#6d604d]">Testnet prototype. Unaudited. No legal-netting opinion, KYC/KYB, credit extension, insurance, FX, or default mutualization. Single USDG asset. Maximum 8 participants and 32 obligations per run.</p></div></div></section>
      </div>
    </main>
  );
}
