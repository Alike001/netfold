import { ArrowDown, ArrowRight, BadgeDollarSign, Building2, CircleDollarSign, Network } from "lucide-react";

const horizons = [
  {
    label: "Now",
    title: "USDG clearing workspace",
    items: ["Real multi-counterparty settlement"],
    tone: "border-[#bfd5f2] bg-arb-soft text-[#164f96]",
  },
  {
    label: "Next",
    title: "Operational scale",
    items: ["Recurring clearing windows", "Business and team workspaces", "Accounting and treasury integrations"],
    tone: "border-line bg-white text-ink",
  },
  {
    label: "Founder House",
    title: "Issuer Rails",
    items: ["Branded settlement tokens backed 1:1 by USDG", "Public reserve verification", "Holder redemption into USDG", "Multi-issuer clearing through USDG"],
    tone: "border-[#c7d3cb] bg-[#f1f7f3] text-[#285b42]",
  },
] as const;

export function FounderHouseRoadmap() {
  return (
    <section id="founder-house-roadmap" className="mx-auto max-w-[1440px] scroll-mt-20 px-6 pt-28 pb-16 lg:px-10 lg:pt-40 lg:pb-20">
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-sm font-bold tracking-[0.13em] text-arb uppercase">Three-horizon roadmap</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">A settlement workspace now. Broader business rails later.</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#606971]">Issuer Rails is a Founder House direction—not an implemented NetFold feature. NetFold does not currently issue stablecoins or branded tokens.</p>
        </div>
        <div className="grid gap-4">
          {horizons.map((horizon, index) => (
            <article key={horizon.label} className={`rounded-xl border p-6 sm:p-7 ${horizon.tone}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.13em] opacity-70">{horizon.label}</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">{horizon.title}</h3></div>
                <span className="font-mono text-xs opacity-55">0{index + 1}</span>
              </div>
              <ul className="mt-5 grid gap-2 text-sm leading-6 sm:grid-cols-2">
                {horizon.items.map((item) => <li key={item} className="flex gap-2"><ArrowRight className="mt-1 shrink-0 opacity-55" size={13} /> {item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#285b42]">Founder House concept diagram</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Branded business value converges into USDG clearing.</h3></div><span className="rounded-full border border-[#eed5a9] bg-[#fff6e6] px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-warning">Roadmap — not implemented</span></div>
        <div className="mt-8 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {["Business token A", "Business token B"].map((label) => <div key={label} className="flex items-center gap-3 rounded-lg border border-line bg-[#f7f8f7] p-4"><Building2 className="text-[#58626b]" size={19} /><div><p className="font-semibold">{label}</p><p className="text-xs text-[#68717a]">Branded settlement token</p></div></div>)}
          </div>
          <div className="grid place-items-center text-arb"><ArrowRight className="hidden lg:block" /><ArrowDown className="lg:hidden" /></div>
          <div className="flex items-center gap-4 rounded-lg border border-[#bfd5f2] bg-arb-soft p-5"><CircleDollarSign className="shrink-0 text-arb" size={28} /><div><p className="font-semibold">USDG reserve & redemption</p><p className="mt-1 text-sm leading-6 text-[#4d6480]">Proposed 1:1 backing, public reserve verification, and holder redemption into USDG.</p></div></div>
          <div className="grid place-items-center text-arb"><ArrowRight className="hidden lg:block" /><ArrowDown className="lg:hidden" /></div>
          <div className="flex items-center gap-4 rounded-lg bg-ink p-5 text-white"><Network className="shrink-0 text-[#79aef8]" size={28} /><div><p className="font-semibold">NetFold clearing</p><p className="mt-1 text-sm leading-6 text-[#bac2c9]">Proposed multi-issuer obligations settle through a common USDG layer.</p></div><BadgeDollarSign className="ml-auto hidden text-[#79aef8] sm:block" size={22} /></div>
        </div>
      </div>
    </section>
  );
}
