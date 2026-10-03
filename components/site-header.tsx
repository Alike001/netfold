import Link from "next/link";
import { WalletButton } from "@/components/wallet-button";

const links = [
  { href: "/app", label: "Product" },
  { href: "/proof", label: "Proof" },
  { href: "/break", label: "Security" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-paper/92 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-[-0.03em] text-ink">
          <span className="grid size-8 place-items-center rounded-md bg-ink text-[11px] font-bold tracking-tight text-white">
            NF
          </span>
          <span className="text-lg">NetFold</span>
        </Link>
        <div className="flex items-center gap-2 lg:gap-6">
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#555d65] md:flex" aria-label="Main navigation">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-ink">
                {link.label}
              </Link>
            ))}
            <span className="cursor-not-allowed text-[#9aa0a6]" title="Repository URL pending">
              GitHub
            </span>
          </nav>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
