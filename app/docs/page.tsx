import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Check, ExternalLink, Network, ShieldCheck, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { netfoldData } from "@/lib/netfold-data";
import { run002Data } from "@/lib/run-002-data";

export const metadata: Metadata = {
  title: "Documentation",
  description: "How NetFold records, nets, covers, and settles mutually approved USDG obligations on Arbitrum.",
};

const lifecycle = ["Record", "Accept", "Net", "Cover", "Settle"] as const;
const safetyProperties = [
  "Named-debtor acceptance",
  "Maximum 8 participants and 32 obligations",
  "Immutable closed batches",
  "Exact residual funding",
  "Complete coverage before settlement",
  "Atomic settlement",
  "No double settlement",
  "Expiry and debtor refund path",
  "Reentrancy protection",
] as const;

export default function DocsPage() {
  return (
    <main className="bg-[#f4f5f3]">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-arb"><BookOpen size={17} /> NetFold documentation</div>
          <h1 className="mt-5 max-w-5xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">Business settlement, from obligation to proof.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#59636c]">NetFold is a business settlement workspace for mutually approved USDG obligations on Arbitrum. It calculates final net positions and releases them only after complete coverage.</p>
          <ol className="mt-9 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-5">
            {lifecycle.map((step, index) => <li key={step} className="flex items-center gap-3 bg-[#fafbfa] p-4"><span className="font-mono text-xs text-arb">0{index + 1}</span><strong>{step}</strong></li>)}
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] space-y-20 px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <section id="example" className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-arb">100 / 60 / 40 example</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Three obligations. One covered net settlement.</h2><p className="mt-5 leading-7 text-[#606971]">This is 70% gross-to-net liquidity compression. It is not a claim of 70% fewer ERC-20 transactions.</p></div>
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            {[['Studio', 'Auditor', '100'], ['Auditor', 'Infrastructure', '60'], ['Infrastructure', 'Studio', '40']].map(([payer, payee, amount]) => <div key={`${payer}-${payee}`} className="flex items-center justify-between gap-4 border-b border-line p-5 last:border-b-0"><span className="font-medium">{payer} <ArrowRight className="mx-2 inline text-arb" size={14} /> {payee}</span><strong className="tabular text-xl">{amount} USDG</strong></div>)}
            <div className="grid gap-px bg-line sm:grid-cols-3"><div className="bg-ink p-5 text-white"><span className="text-xs text-[#adb5bd]">Gross</span><strong className="tabular mt-2 block text-3xl">200</strong></div><div className="bg-ink p-5 text-white"><span className="text-xs text-[#adb5bd]">Required liquidity</span><strong className="tabular mt-2 block text-3xl">60</strong></div><div className="bg-arb-soft p-5 text-[#144f9f]"><span className="text-xs">Compression</span><strong className="tabular mt-2 block text-3xl">70%</strong></div></div>
          </div>
        </section>

        <section id="use" className="rounded-xl border border-line bg-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.13em] text-arb">How to use NetFold</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Actions follow roles and onchain state.</h2><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[
          ["Creator", "Create the run, add participants, propose obligations, and close the fully accepted batch."],
          ["Payer", "Review the pending obligation and explicitly accept only the amount assigned to your wallet."],
          ["Net debtor", "Approve exactly the finalized USDG requirement, then fund the entire residual debit."],
          ["Any wallet", "Settle a fully covered run once total funded equals the final total net debit."],
          ["Expired run", "Anyone can expire an eligible closed run; each funded debtor claims its own refund."],
        ].map(([role, body]) => <article key={role} className="rounded-lg border border-line bg-[#fafbfa] p-5"><h3 className="font-semibold">{role}</h3><p className="mt-2 text-sm leading-6 text-[#606971]">{body}</p></article>)}</div></section>

        <section id="test" className="grid gap-5 lg:grid-cols-2"><article className="rounded-xl border border-line bg-white p-7"><Badge>Quick review</Badge><h2 className="mt-5 text-2xl font-semibold">No wallet or testnet assets required.</h2><p className="mt-3 text-sm leading-6 text-[#606971]">Inspect canonical Run #001, the <Link href="/proof" className="text-arb hover:underline">proof page</Link>, and the <Link href="/break" className="text-arb hover:underline">failure evidence</Link>.</p></article><article className="rounded-xl border border-[#bfd5f2] bg-arb-soft p-7"><Badge tone="blue">Full product</Badge><h2 className="mt-5 text-2xl font-semibold">Execute a real Sepolia run.</h2><p className="mt-3 text-sm leading-6 text-[#4d6480]">Connect a wallet, create a run, invite counterparties, accept, close, fund the residual, and settle. Arbitrum Sepolia ETH is required for gas; canonical Paxos test USDG is required only for net debtors. Test tokens have no value, and faucet availability is not guaranteed.</p></article></section>

        <section id="architecture" className="rounded-xl bg-ink p-7 text-white sm:p-10"><div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#79aef8]">Protocol architecture</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Public state, user-signed transactions.</h2><p className="mt-5 text-sm leading-7 text-[#bac2c9]">There is no database, custodial signer, hidden relayer, or private backend controlling settlement.</p></div><div className="grid justify-items-center gap-3">{[[WalletCards, "Browser / Wallet"], [Network, "NetFoldClearing"], [ShieldCheck, "Canonical Paxos test USDG"], [Network, "Arbitrum Sepolia"]].map(([Icon, label], index) => <div key={label as string} className="contents"><div className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-4"><Icon className="text-[#79aef8]" size={19} /><strong>{label as string}</strong></div>{index < 3 && <ArrowDown className="text-[#79aef8]" size={16} />}</div>)}</div></div></section>

        <section id="safety"><p className="text-xs font-bold uppercase tracking-[0.13em] text-arb">Safety properties</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Enforced boundaries, not an audit claim.</h2><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{safetyProperties.map((property) => <div key={property} className="flex items-center gap-3 rounded-lg border border-line bg-white p-4 text-sm font-medium"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-success-soft text-success"><Check size={13} /></span>{property}</div>)}</div><p className="mt-4 text-sm text-[#68717a]">NetFold is unaudited. Passing tests and verified runs are engineering evidence, not a security audit.</p></section>

        <section id="runs"><p className="text-xs font-bold uppercase tracking-[0.13em] text-arb">Proven runs</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Two proofs, two distinct purposes.</h2><div className="mt-7 grid gap-5 lg:grid-cols-2"><article className="rounded-xl border border-line bg-white p-7"><Badge tone="blue">Canonical protocol proof</Badge><h3 className="mt-5 text-3xl font-semibold">Run #001</h3><p className="tabular mt-6 text-4xl font-semibold tracking-[-0.05em]">{netfoldData.display.gross} → {netfoldData.display.liquidity} → {netfoldData.display.compression}</p><p className="mt-2 text-sm text-[#68717a]">Gross · liquidity · compression</p><Badge tone="success" className="mt-6">Settled</Badge><p className="mt-5"><Link href="/proof" className="inline-flex items-center gap-2 font-semibold text-arb hover:underline">Inspect deep proof <ArrowRight size={15} /></Link></p></article><article className="rounded-xl border border-[#bfd5f2] bg-arb-soft p-7"><Badge tone="blue">Production frontend acceptance</Badge><h3 className="mt-5 text-3xl font-semibold">Run #002</h3><p className="tabular mt-6 text-4xl font-semibold tracking-[-0.05em]">{run002Data.display.gross} → {run002Data.display.liquidity} → {run002Data.display.compression}</p><p className="mt-2 text-sm text-[#4d6480]">Gross · liquidity · compression</p><Badge tone="success" className="mt-6">Settled</Badge><p className="mt-5 text-sm leading-6 text-[#4d6480]">Created and operated through the deployed public application using Alice, Bob, and Carol wallets.</p><a href={run002Data.links.settlement} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-arb hover:underline">Settlement transaction <ExternalLink size={13} /></a></article></div></section>

        <section id="limitations" className="grid gap-8 lg:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.13em] text-arb">Limitations</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Testnet product, explicit scope.</h2></div><ul className="grid gap-3 text-sm sm:grid-cols-2">{["Arbitrum Sepolia only", "Test tokens have no value", "Unaudited", "No legal-netting opinion", "No credit", "No default mutualization", "No KYC/KYB", "One settlement asset", "Maximum 8 participants", "Maximum 32 obligations", "Public-RPC event discovery without an indexer"].map((item) => <li key={item} className="rounded-lg border border-line bg-white p-4">{item}</li>)}</ul></section>

        <section id="roadmap" className="rounded-xl border border-line bg-white p-7 sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.13em] text-arb">Roadmap</p><div className="mt-7 grid gap-4 lg:grid-cols-3"><article className="rounded-lg bg-arb-soft p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-arb">Now</p><h3 className="mt-3 text-xl font-semibold">USDG business settlement workspace</h3></article><article className="rounded-lg bg-[#f5f6f5] p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#68717a]">Next</p><ul className="mt-3 space-y-2 text-sm"><li>Recurring clearing windows</li><li>Business/team workspaces</li><li>Accounting/treasury integrations</li></ul></article><article className="rounded-lg border border-[#c7d3cb] bg-[#f1f7f3] p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#285b42]">Founder House · unimplemented</p><h3 className="mt-3 text-xl font-semibold">Issuer Rails</h3><ul className="mt-3 space-y-2 text-sm text-[#3d614e]"><li>Branded business settlement tokens</li><li>1:1 USDG backing</li><li>Reserve verification</li><li>Redemption into USDG</li><li>Multi-issuer USDG clearing</li></ul></article></div><p className="mt-5 text-sm text-[#68717a]">All Issuer Rails functionality is unimplemented roadmap scope. NetFold contains no stablecoin issuance contracts.</p></section>
      </div>
    </main>
  );
}
