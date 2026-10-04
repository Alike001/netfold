import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsdg(baseUnits: number, options?: { technical?: boolean }) {
  if (!Number.isSafeInteger(baseUnits) || baseUnits < 0) {
    throw new Error("USDG base units must be a non-negative safe integer");
  }

  const value = baseUnits / 1_000_000;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: options?.technical ? 6 : 0,
    maximumFractionDigits: 6,
  }).format(value);
}

export function formatUsdgBigint(baseUnits: bigint, options?: { technical?: boolean }) {
  if (baseUnits < 0n) throw new Error("USDG base units must be non-negative");
  const whole = baseUnits / 1_000_000n;
  const fraction = (baseUnits % 1_000_000n).toString().padStart(6, "0");
  const trimmed = options?.technical ? fraction : fraction.replace(/0+$/, "");
  return `${whole.toLocaleString("en-US")}${trimmed ? `.${trimmed}` : ""}`;
}

export function formatCompression(bps: number) {
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) {
    throw new Error("Compression basis points must be between 0 and 10,000");
  }
  return `${bps / 100}%`;
}

export function truncateAddress(value: string, leading = 6, trailing = 4) {
  if (value.length <= leading + trailing + 1) return value;
  return `${value.slice(0, leading)}…${value.slice(-trailing)}`;
}

export function truncateHash(value: string) {
  return truncateAddress(value, 10, 8);
}
