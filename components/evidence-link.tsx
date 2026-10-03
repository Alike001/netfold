import { ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { truncateAddress, truncateHash } from "@/lib/utils";

export function EvidenceLink({
  value,
  href,
  kind = "address",
  tone = "default",
}: {
  value: string;
  href: string;
  kind?: "address" | "hash" | "block";
  tone?: "default" | "inverse";
}) {
  const label = kind === "hash" ? truncateHash(value) : kind === "address" ? truncateAddress(value) : value;

  return (
    <span className="inline-flex max-w-full items-center gap-1 font-mono text-xs">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={
          tone === "inverse"
            ? "inline-flex min-w-0 items-center gap-1.5 text-white underline decoration-white/40 underline-offset-4 transition hover:text-[#9ec9ff]"
            : "inline-flex min-w-0 items-center gap-1.5 text-[#35414b] underline decoration-[#b8c0c7] underline-offset-4 transition hover:text-arb"
        }
      >
        <span className="truncate">{label}</span>
        <ExternalLink className="shrink-0" size={12} />
      </a>
      {kind !== "block" && (
        <CopyButton
          value={value}
          className={tone === "inverse" ? "text-white/70 hover:bg-white/10 hover:text-white" : undefined}
        />
      )}
    </span>
  );
}
