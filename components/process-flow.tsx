"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const steps = [
  ["Record", "Businesses create USDG obligations inside a bounded clearing run."],
  ["Accept", "The named debtor explicitly accepts exactly what it owes."],
  ["Net", "NetFold freezes the batch and calculates final debit and credit positions."],
  ["Cover & settle", "Net debtors fund exact residual balances. Nothing releases until fully covered."],
] as const;

export function ProcessFlow() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const media = gsap.matchMedia();
      media.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: section.current,
          start: "top top+=112",
          end: "bottom bottom-=120",
          pin: title.current,
          pinSpacing: false,
        });
      });
      gsap.fromTo(
        ".process-card",
        { y: 70, opacity: 0.55, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: section.current, start: "top 68%", end: "bottom 70%", scrub: 0.7 },
        },
      );
      return () => media.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} className="mx-auto grid max-w-[1440px] gap-14 px-6 py-28 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-40">
      <div ref={title} className="h-fit max-w-lg">
        <p className="text-sm font-bold tracking-[0.13em] text-arb uppercase">From payable to proof</p>
        <h2 className="mt-5 text-4xl leading-[1.02] font-semibold tracking-[-0.055em] sm:text-6xl">
          A clearing process operations teams can explain.
        </h2>
      </div>
      <div className="space-y-5 lg:pt-36">
        {steps.map(([title, body], index) => (
          <article key={title} className="process-card sticky rounded-xl border border-line bg-white p-7 shadow-[0_12px_40px_rgba(22,34,48,0.07)] sm:p-9" style={{ top: 116 + index * 18 }}>
            <div className="flex items-start gap-6">
              <span className="font-mono text-sm text-arb">0{index + 1}</span>
              <div>
                <h3 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 max-w-xl text-base leading-7 text-[#606971]">{body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
