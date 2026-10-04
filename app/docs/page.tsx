import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { DocsNavigation } from "@/app/docs/docs-navigation";
import { Badge } from "@/components/ui/badge";
import { REPOSITORY_URL } from "@/lib/constants";
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
const sectionClass = "scroll-mt-32 border-b border-line pb-16 last:border-b-0";

export default function DocsPage() {
  return (
    <main className="bg-[#f7f8f6]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-7 sm:py-14 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold text-arb">NetFold Docs</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Business settlement on USDG</h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-[#5d6670]">Product usage, protocol architecture, safety properties, and verified settlement evidence for NetFold on Arbitrum Sepolia.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/app" className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2a2d30]">Open app <ArrowRight size={14} /></Link>
              <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold hover:border-[#aeb5bc]">GitHub <ExternalLink size={13} /></a>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-10 sm:px-7 lg:grid-cols-[13rem_minmax(0,46rem)] lg:gap-16 lg:px-10 lg:py-16 xl:grid-cols-[14rem_minmax(0,48rem)] xl:gap-20">
        <DocsNavigation />

        <article className="min-w-0 space-y-16">
          <section id="introduction" tabIndex={-1} className={sectionClass}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-arb">Introduction</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">A business settlement workspace for mutually approved obligations.</h2>
            <p className="mt-6 max-w-[65ch] text-base leading-8 text-[#505a63]">NetFold is a business settlement workspace for mutually approved USDG obligations on Arbitrum. It calculates final net positions and releases them only after complete coverage.</p>
            <ol className="mt-8 grid overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-5">
              {lifecycle.map((step, index) => <li key={step} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:block sm:border-r sm:border-b-0 sm:last:border-r-0"><span className="font-mono text-[11px] text-arb">0{index + 1}</span><strong className="text-sm sm:mt-1 sm:block">{step}</strong></li>)}
            </ol>
          </section>

          <section id="how-it-works" tabIndex={-1} className={sectionClass}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-arb">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">The 100 / 60 / 40 example</h2>
            <p className="mt-5 max-w-[65ch] leading-7 text-[#59636c]">Studio owes Auditor 100 USDG. Auditor owes Infrastructure 60 USDG. Infrastructure owes Studio 40 USDG. NetFold offsets what each party owes and receives.</p>
            <div className="mt-7 overflow-hidden rounded-lg border border-line bg-white">
              {[["Studio", "Auditor", "100"], ["Auditor", "Infrastructure", "60"], ["Infrastructure", "Studio", "40"]].map(([payer, payee, amount]) => <div key={`${payer}-${payee}`} className="flex flex-col gap-2 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm font-medium">{payer} <ArrowRight className="mx-2 inline text-arb" size={13} /> {payee}</span><strong className="tabular text-lg">{amount} USDG</strong></div>)}
              <dl className="grid bg-[#f0f3f5] sm:grid-cols-3">
                <div className="p-5"><dt className="text-xs text-[#68727b]">Gross</dt><dd className="tabular mt-1 text-3xl font-semibold">200 <span className="text-sm font-medium">USDG</span></dd></div>
                <div className="border-y border-line p-5 sm:border-x sm:border-y-0"><dt className="text-xs text-[#68727b]">Required liquidity</dt><dd className="tabular mt-1 text-3xl font-semibold">60 <span className="text-sm font-medium">USDG</span></dd></div>
                <div className="bg-arb-soft p-5 text-[#174f9e]"><dt className="text-xs">Compression</dt><dd className="tabular mt-1 text-3xl font-semibold">70%</dd></div>
              </dl>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#68727b]">This is 70% gross-to-net liquidity compression. It is not a claim of 70% fewer ERC-20 transactions.</p>
          </section>

          <section id="using-netfold" tabIndex={-1} className={sectionClass}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-arb">Using NetFold</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Actions follow roles and onchain state.</h2>
            <div className="mt-7 divide-y divide-line border-y border-line">{[
              ["Creator", "Create the run, add participants, propose obligations, and close the fully accepted batch."],
              ["Payer", "Review the pending obligation and explicitly accept only the amount assigned to your wallet."],
              ["Net debtor", "Approve exactly the finalized USDG requirement, then fund the entire residual debit."],
              ["Any wallet", "Settle a fully covered run once total funded equals the final total net debit."],
              ["Expired run", "Anyone can expire an eligible closed run; each funded debtor claims its own refund."],
            ].map(([role, body]) => <div key={role} className="grid gap-2 py-5 sm:grid-cols-[9rem_1fr]"><h3 className="font-semibold">{role}</h3><p className="text-sm leading-6 text-[#59636c]">{body}</p></div>)}</div>
          </section>

          <section id="how-to-test" tabIndex={-1} className={sectionClass}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-arb">How to test</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Review evidence or execute the product.</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-white p-5"><Badge>Quick review</Badge><h3 className="mt-4 text-lg font-semibold">No wallet required</h3><p className="mt-2 text-sm leading-6 text-[#59636c]">Inspect canonical Run #001, the <Link href="/proof" className="font-medium text-arb hover:underline">proof page</Link>, and the <Link href="/break" className="font-medium text-arb hover:underline">failure evidence</Link>.</p></div>
              <div className="rounded-lg border border-[#bfd5f2] bg-arb-soft p-5"><Badge tone="blue">Full product</Badge><h3 className="mt-4 text-lg font-semibold">Execute a real Sepolia run</h3><p className="mt-2 text-sm leading-6 text-[#4d6480]">Connect a wallet, create a run, invite counterparties, accept, close, fund the residual, and settle.</p></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#68727b]">Arbitrum Sepolia ETH is required for gas; canonical Paxos test USDG is required only for net debtors. Test tokens have no value, and faucet availability is not guaranteed.</p>
          </section>

          <section id="architecture" tabIndex={-1} className={sectionClass}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-arb">Architecture</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Public state, user-signed transactions.</h2>
            <div className="mt-7 overflow-hidden rounded-lg border border-line bg-white font-mono text-sm">
              {["Browser / Wallet", "NetFoldClearing", "Canonical Paxos test USDG", "Arbitrum Sepolia"].map((item, index) => <div key={item} className="border-b border-line px-5 py-4 last:border-b-0"><span className="mr-4 text-[11px] text-arb">0{index + 1}</span>{item}</div>)}
            </div>
            <p className="mt-5 max-w-[65ch] leading-7 text-[#59636c]">There is no database, custodial signer, hidden relayer, or private backend controlling settlement.</p>
          </section>

          <section id="safety" tabIndex={-1} className={sectionClass}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-arb">Safety properties</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Enforced boundaries, not an audit claim.</h2>
            <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">{safetyProperties.map((property) => <li key={property} className="flex items-start gap-3 text-sm leading-6"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success"><Check size={11} /></span>{property}</li>)}</ul>
            <p className="mt-6 text-sm text-[#68727b]">NetFold is unaudited. Passing tests and verified runs are engineering evidence, not a security audit.</p>
          </section>

          <section id="run-001" tabIndex={-1} className={sectionClass}>
            <Badge tone="blue">Canonical protocol proof</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Run #001</h2>
            <p className="tabular mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{netfoldData.display.gross} → {netfoldData.display.liquidity} → {netfoldData.display.compression}</p>
            <p className="mt-2 text-sm text-[#68727b]">Gross obligations · required liquidity · compression</p>
            <div className="mt-6 flex flex-wrap items-center gap-4"><Badge tone="success">Settled</Badge><Link href="/proof" className="inline-flex items-center gap-2 text-sm font-semibold text-arb hover:underline">Inspect deep proof <ArrowRight size={14} /></Link></div>
          </section>

          <section id="run-002" tabIndex={-1} className={sectionClass}>
            <Badge tone="blue">Production frontend acceptance</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Run #002</h2>
            <p className="tabular mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{run002Data.display.gross} → {run002Data.display.liquidity} → {run002Data.display.compression}</p>
            <p className="mt-2 text-sm text-[#68727b]">Gross obligations · required liquidity · compression</p>
            <div className="mt-6 flex flex-wrap items-center gap-4"><Badge tone="success">Settled</Badge><a href={run002Data.links.settlement} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-arb hover:underline">Settlement transaction <ExternalLink size={13} /></a></div>
            <p className="mt-5 max-w-[65ch] text-sm leading-6 text-[#59636c]">Created and operated through the deployed public application using Alice, Bob, and Carol wallets.</p>
          </section>

          <section id="limitations" tabIndex={-1} className={sectionClass}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-arb">Limitations</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Testnet product, explicit scope.</h2>
            <ul className="mt-7 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">{["Arbitrum Sepolia only", "Test tokens have no value", "Unaudited", "No legal-netting opinion", "No credit", "No default mutualization", "No KYC/KYB", "One settlement asset", "Maximum 8 participants", "Maximum 32 obligations", "Public-RPC event discovery without an indexer"].map((item) => <li key={item} className="border-b border-line pb-3">{item}</li>)}</ul>
          </section>

          <section id="roadmap" tabIndex={-1} className={sectionClass}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-arb">Roadmap</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Product horizons</h2>
            <div className="mt-7 space-y-6">
              <div className="grid gap-2 sm:grid-cols-[8rem_1fr]"><p className="text-xs font-bold uppercase tracking-[0.12em] text-arb">Now</p><p className="font-semibold">USDG business settlement workspace</p></div>
              <div className="grid gap-2 border-t border-line pt-6 sm:grid-cols-[8rem_1fr]"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#68727b]">Next</p><ul className="space-y-2 text-sm"><li>Recurring clearing windows</li><li>Business/team workspaces</li><li>Accounting/treasury integrations</li></ul></div>
              <div className="grid gap-2 border-t border-line pt-6 sm:grid-cols-[8rem_1fr]"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#285b42]">Founder House</p><div><h3 className="font-semibold">Issuer Rails <span className="ml-2 text-xs font-medium text-[#68727b]">Unimplemented</span></h3><ul className="mt-3 space-y-2 text-sm text-[#4f6258]"><li>Branded business settlement tokens</li><li>1:1 USDG backing</li><li>Reserve verification</li><li>Redemption into USDG</li><li>Multi-issuer USDG clearing</li></ul></div></div>
            </div>
            <p className="mt-6 text-sm leading-6 text-[#68727b]">All Issuer Rails functionality is unimplemented roadmap scope. NetFold contains no stablecoin issuance contracts.</p>
          </section>

          <footer className="rounded-lg border border-line bg-white p-5 sm:p-6" aria-label="Protocol references">
            <dl className="space-y-5 text-sm">
              <div><dt className="font-semibold">Contract</dt><dd className="mt-1 break-all font-mono text-xs leading-5"><a href={netfoldData.links.address(netfoldData.deployment.contract)} target="_blank" rel="noreferrer" className="text-arb hover:underline">{netfoldData.deployment.contract}</a></dd></div>
              <div><dt className="font-semibold">Arbitrum Sepolia</dt><dd className="mt-1 font-mono text-xs text-[#68727b]">Chain ID {netfoldData.network.chainId}</dd></div>
              <div><dt className="font-semibold">Canonical Paxos test USDG</dt><dd className="mt-1 break-all font-mono text-xs leading-5"><a href={netfoldData.links.address(netfoldData.deployment.token)} target="_blank" rel="noreferrer" className="text-arb hover:underline">{netfoldData.deployment.token}</a></dd></div>
              <div><dt className="font-semibold">Source verification</dt><dd className="mt-1"><a href={netfoldData.deployment.verificationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-arb hover:underline">Sourcify exact match <ExternalLink size={13} /></a></dd></div>
            </dl>
          </footer>
        </article>
      </div>
    </main>
  );
}
