import Link from "next/link";
import { REPOSITORY_URL } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-10 text-sm text-[#626a72] sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>NetFold · Covered USDG clearing on Arbitrum Sepolia.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/docs" className="hover:text-ink">Docs</Link>
          <Link href="/proof" className="hover:text-ink">Proof</Link>
          <Link href="/break" className="hover:text-ink">Security</Link>
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="hover:text-ink">GitHub</a>
          <span>Testnet only · Unaudited</span>
        </div>
      </div>
    </footer>
  );
}
