import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { WalletButton } from "@/components/wallet-button";
import { REPOSITORY_URL } from "@/lib/constants";

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
            <NavLinks />
            <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="rounded-sm transition hover:text-ink">
              GitHub
            </a>
          </nav>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
