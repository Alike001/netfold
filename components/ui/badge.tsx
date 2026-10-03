import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "success" | "warning" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] uppercase",
        tone === "neutral" && "border-line bg-white text-[#596169]",
        tone === "blue" && "border-[#c8daf8] bg-arb-soft text-[#1557b4]",
        tone === "success" && "border-[#bde4d1] bg-success-soft text-success",
        tone === "warning" && "border-[#eed5a9] bg-[#fff6e6] text-warning",
        tone === "danger" && "border-[#efc0bd] bg-[#fff0ef] text-danger",
        className,
      )}
    >
      {children}
    </span>
  );
}
