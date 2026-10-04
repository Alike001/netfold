"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  { label: "Overview", items: [["introduction", "Introduction"], ["how-it-works", "How it works"]] },
  { label: "Product", items: [["using-netfold", "Using NetFold"], ["how-to-test", "How to test"]] },
  { label: "Protocol", items: [["architecture", "Architecture"], ["safety", "Safety properties"]] },
  { label: "Evidence", items: [["run-001", "Run #001"], ["run-002", "Run #002"]] },
  { label: "Reference", items: [["limitations", "Limitations"], ["roadmap", "Roadmap"]] },
] as const;

const sectionIds = groups.flatMap((group) => group.items.map(([id]) => id));

function NavigationLinks({ active, onActivate, onNavigate }: { active: string; onActivate: (id: string) => void; onNavigate?: () => void }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#89919a]">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => {
                    onActivate(id);
                    setTimeout(() => onNavigate?.(), 0);
                    setTimeout(() => document.getElementById(id)?.focus({ preventScroll: true }), 450);
                  }}
                  aria-current={active === id ? "location" : undefined}
                  className={cn(
                    "block rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
                    active === id
                      ? "border-arb bg-arb-soft font-semibold text-[#174f9e]"
                      : "border-transparent text-[#59636c] hover:bg-white hover:text-ink",
                  )}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function DocsNavigation() {
  const [active, setActive] = useState("introduction");
  const mobileContents = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: 0 },
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <aside className="sticky top-24 hidden self-start lg:block" aria-label="Documentation sections">
        <NavigationLinks active={active} onActivate={setActive} />
      </aside>
      <details ref={mobileContents} className="group sticky top-[4.9rem] z-30 mb-8 rounded-lg border border-line bg-white/95 shadow-[0_8px_24px_rgba(25,39,52,0.08)] backdrop-blur lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span>Contents</span>
          <ChevronDown size={16} className="text-[#69727b] transition-transform group-open:rotate-180" />
        </summary>
        <nav className="max-h-[65vh] overflow-y-auto border-t border-line px-2 py-4" aria-label="Documentation sections">
          <NavigationLinks active={active} onActivate={setActive} onNavigate={() => mobileContents.current?.removeAttribute("open")} />
        </nav>
      </details>
    </>
  );
}
