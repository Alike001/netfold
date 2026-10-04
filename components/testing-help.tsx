import Link from "next/link";
import { CircleHelp, Fuel, Search, WalletCards } from "lucide-react";

export function TestingHelp() {
  return (
    <section className="rounded-xl border border-line bg-white p-6 sm:p-7">
      <div className="flex items-center gap-2"><CircleHelp size={18} className="text-arb" /><h2 className="text-xl font-semibold">Testing NetFold</h2></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-[#f5f6f5] p-5">
          <p className="text-xs font-bold tracking-[0.12em] text-[#68717a]">QUICK REVIEW</p>
          <p className="mt-2 text-sm leading-6 text-[#535b63]">No wallet needed. Inspect verified Run #001, its <Link className="text-arb hover:underline" href="/proof">live proof</Link>, and <Link className="text-arb hover:underline" href="/break">failure evidence</Link>.</p>
        </div>
        <div className="rounded-lg bg-arb-soft p-5">
          <p className="text-xs font-bold tracking-[0.12em] text-arb">LIVE PRODUCT TEST</p>
          <p className="mt-2 text-sm leading-6 text-[#385371]">Connect on Arbitrum Sepolia, create a run, invite participants, accept, close, fund exact net debits, then settle.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-[#535b63] sm:grid-cols-2">
        <p className="flex gap-2"><Fuel className="mt-0.5 shrink-0 text-warning" size={16} /> Arbitrum Sepolia ETH is required for gas.</p>
        <p className="flex gap-2"><WalletCards className="mt-0.5 shrink-0 text-arb" size={16} /> Canonical Paxos test USDG is needed only by net debtors.</p>
      </div>
      <p className="mt-4 flex gap-2 text-xs text-[#68717a]"><Search size={14} /> Testnet tokens have no value. Faucet availability varies by region and provider.</p>
    </section>
  );
}
