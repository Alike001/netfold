# NetFold — Project Description

## One-line pitch

NetFold lets stablecoin-native businesses settle mutually approved USDG obligations by funding only their final net positions on Arbitrum.

## Problem

Businesses can owe each other money in both directions. Paying every obligation independently makes each gross payment compete for liquidity even when most of the economic exposure offsets. Existing accounting tools can calculate balances, but they do not prove debtor consent, full onchain coverage, and atomic settlement from one public record.

## Solution

NetFold records bounded USDG obligations, requires each named debtor to accept its own obligation, freezes an accepted run, calculates final net debit and credit positions, and requires exact covered funding before releasing anything. The live example compresses 200 USDG of gross obligations into 60 USDG of required settlement liquidity—a 70% gross-to-net compression.

## Why Arbitrum

Clearing benefits from inexpensive, fast, publicly verifiable state transitions. Arbitrum provides an EVM environment where obligation acceptance, coverage, failure conditions, and final settlement can be inspected with standard tooling while avoiding mainnet-cost friction during product validation.

## Why USDG

USDG is a dollar-denominated settlement asset suited to business obligations. NetFold uses canonical Paxos test USDG on Arbitrum Sepolia, with six-decimal accounting that mirrors familiar dollar precision. The prototype does not issue a token and does not use `MockUSDG` on public testnet.

## Technical architecture

- `NetFoldClearing.sol`: bounded clearing state machine with debtor acceptance, close/finalize, exact covered funding, atomic settlement, expiry, and debtor refunds.
- Canonical Paxos test USDG: settlement token on Arbitrum Sepolia.
- Next.js App Router frontend: public landing, business workspace, live run, proof, and failure-evidence routes.
- `/create`: validates 2–8 unique participant addresses and a future deadline, submits `createRun`, waits for its receipt, decodes `RunCreated`, and opens the resulting run.
- `/runs/[runId]`: reads arbitrary runs directly from the deployed contract and exposes only actions available to the connected wallet in the current onchain state.
- `/docs`: one judge-facing guide to the product lifecycle, roles, architecture, safety properties, proven runs, limitations, and roadmap.
- Complete public write path: `createRun`, `proposeObligation`, `acceptObligation`, `cancelObligation`, `cancelRun`, `closeRun`, exact USDG approval, `fund`, `settleRun`, `expireRun`, and `claimRefund`.
- Role-aware actions: creator controls, named-payer acceptance, exact net-debtor funding, permissionless covered settlement and expiry, and debtor-only refunds.
- Live contract reads: run, participants, obligation IDs, obligations, finalized positions, required funding, allowance, balances, coverage, and compression.
- Event-based wallet discovery: `RunCreated` finds runs created by the connected wallet; `ObligationProposed` finds payer obligations, which are re-read before being shown as current attention items.
- Receipt-confirmed transaction UX: wallet confirmation, broadcast hash, receipt status, Arbiscan link, state refresh, and known NetFold custom-error decoding.
- Typed evidence layer: imports and validates committed deployment and lifecycle JSON artifacts.
- viem/wagmi: typed Arbitrum Sepolia reads, event queries, injected-wallet connection, network switching, writes, and receipt handling.
- No database, custodial signer, private backend, AI layer, or credit engine. Users sign every transaction in their own wallet.

## Live evidence

- App: https://netfold-delta.vercel.app
- Proof: https://netfold-delta.vercel.app/proof
- Production acceptance run: https://netfold-delta.vercel.app/runs/2
- Network: Arbitrum Sepolia, chain ID `421614`
- NetFold: `0x516479a53483b675Fe4629E3C63088c51cf6eFa7`
- Canonical Paxos test USDG: `0xFFC95faa3d63Cde504a05B567C600B78C0b41892`
- Run #001 settlement: `0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3`
- Run #001 accounting: 200 USDG gross, 60 USDG total net debit, 60 USDG total net credit, 70% compression, zero accounted liability.
- Run #002 settlement: `0xf173ecfc0232412a0e25ccc4d455819c10a50a3f424d3002c85af78a10bb845f`
- Run #002 accounting: 20 USDG gross, 6 USDG total net debit, 6 USDG total net credit, 70% compression, zero accounted liability.
- Verification: Sourcify exact creation and runtime match.

Run #001 remains the canonical deep protocol and lifecycle proof. Run #002 is separate production-frontend acceptance evidence: Alice, Bob, and Carol completed the 10/6/4 lifecycle using real wallet transactions through the deployed public application. Its receipts and final state were independently reconstructed over read-only Arbitrum Sepolia RPC calls.

## Differentiation

NetFold is not simply a balance calculator. Its public state machine ties each final position to debtor-approved obligations, blocks release before complete coverage, and settles all final credits atomically. It does not provide credit or mutualize a participant's default. It also makes no claim of legal netting or 70% fewer token transfers.

## Roadmap

NetFold currently provides a live USDG clearing workspace with real multi-counterparty settlement. Next, it would add recurring clearing windows, business/team workspaces, and accounting and treasury integrations.

At Founder House, the longer-term **Issuer Rails** direction would explore branded business settlement tokens backed 1:1 by USDG, public reserve verification, holder redemption into USDG, and multi-issuer clearing through USDG. Issuer Rails is not implemented in NetFold today; this repository contains no stablecoin issuance contracts.
