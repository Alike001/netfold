import type { ReactNode } from "react";

export function MetricCard({ label, value, suffix }: { label: string; value: ReactNode; suffix?: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5 sm:p-6">
      <p className="text-sm text-[#68717a]">{label}</p>
      <div className="tabular mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{value}</div>
      {suffix && <p className="mt-2 text-sm text-[#68717a]">{suffix}</p>}
    </div>
  );
}
