"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { useRef } from "react";
import { formatUsdg } from "@/lib/utils";
import { netfoldData } from "@/lib/netfold-data";

gsap.registerPlugin(useGSAP);

export function ClearingVisualization() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      timeline
        .fromTo(".gross-line", { opacity: 0, x: -12 }, { opacity: 1, x: 0, stagger: 0.18, duration: 0.55 })
        .to(".gross-panel", { opacity: 0.18, scale: 0.98, duration: 0.5 }, "+=1.5")
        .to(".net-panel", { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }, "<")
        .fromTo(".net-line", { opacity: 0, x: 12 }, { opacity: 1, x: 0, stagger: 0.18, duration: 0.5 }, "<0.1")
        .to(".net-panel", { opacity: 0, y: 8, duration: 0.4 }, "+=2.2")
        .to(".gross-panel", { opacity: 1, scale: 1, duration: 0.4 }, "<");
    },
    { scope },
  );

  return (
    <div ref={scope} className="relative min-h-[510px] overflow-hidden rounded-xl border border-[#cbd1d7] bg-white shadow-[0_24px_80px_rgba(22,34,48,0.12)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#6a737b] uppercase">Clearing preview</p>
          <p className="mt-1 text-sm font-semibold">Run #001 · USDG</p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-success">
          <span className="size-2 rounded-full bg-success" /> Live evidence
        </span>
      </div>

      <div className="relative h-[350px] p-5 sm:p-7">
        <div className="gross-panel absolute inset-5 sm:inset-7">
          <p className="mb-5 text-sm text-[#687078]">Mutually accepted obligations</p>
          <div className="space-y-3">
            {netfoldData.obligations.map((item) => (
              <div key={item.id} className="gross-line grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-line bg-[#fbfbfa] px-4 py-4">
                <span className="font-semibold">{item.payer.name}</span>
                <span className="flex items-center gap-2 font-mono text-sm font-semibold text-arb">
                  {formatUsdg(item.amount)} <ArrowRight size={14} />
                </span>
                <span className="text-right font-semibold">{item.payee.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-[#687078]">Gross obligations</span>
            <strong className="tabular text-3xl tracking-[-0.04em]">{netfoldData.display.gross} USDG</strong>
          </div>
        </div>

        <div className="net-panel absolute inset-5 translate-y-2 bg-white opacity-0 sm:inset-7">
          <p className="mb-5 text-sm text-[#687078]">One fully covered net settlement</p>
          <div className="rounded-lg border border-[#b9d9c9] bg-success-soft p-5">
            <div className="net-line flex items-center justify-between border-b border-[#cce5d9] pb-4">
              <span className="font-semibold">Studio funds</span>
              <strong className="font-mono text-xl">60 USDG</strong>
            </div>
            <div className="net-line flex items-center justify-between py-4">
              <span className="flex items-center gap-2"><CircleCheck size={16} /> Auditor receives</span>
              <strong className="font-mono">40 USDG</strong>
            </div>
            <div className="net-line flex items-center justify-between border-t border-[#cce5d9] pt-4">
              <span className="flex items-center gap-2"><CircleCheck size={16} /> Infrastructure receives</span>
              <strong className="font-mono">20 USDG</strong>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-line p-3">
              <span className="block text-xs text-[#687078]">Net liquidity</span>
              <strong className="tabular mt-1 block text-2xl tracking-[-0.04em]">60 USDG</strong>
            </div>
            <div className="rounded-md border border-line p-3">
              <span className="block text-xs text-[#687078]">Compression</span>
              <strong className="tabular mt-1 block text-2xl tracking-[-0.04em]">70%</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-line bg-[#fafaf8]">
        {[
          ["200 USDG", "Gross obligations"],
          ["60 USDG", "Net liquidity"],
          ["70%", "Compression"],
        ].map(([value, label]) => (
          <div key={label} className="border-r border-line px-3 py-4 last:border-r-0 sm:px-5">
            <strong className="tabular block text-base tracking-[-0.03em] sm:text-xl">{value}</strong>
            <span className="mt-1 block text-[10px] leading-tight text-[#6b737b] sm:text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
