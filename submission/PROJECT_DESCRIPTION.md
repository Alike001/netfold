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
- Next.js App Router frontend: public landing, workspace, proof, and failure-evidence routes.
- Typed evidence layer: imports and validates committed deployment and lifecycle JSON artifacts.
- viem/wagmi: typed Arbitrum configuration plus optional injected-wallet connection.
- No database, AI layer, private backend, or credit engine.

## Live evidence

- App: https://netfold-delta.vercel.app
- Proof: https://netfold-delta.vercel.app/proof
- Network: Arbitrum Sepolia, chain ID `421614`
- NetFold: `0x516479a53483b675Fe4629E3C63088c51cf6eFa7`
- Canonical Paxos test USDG: `0xFFC95faa3d63Cde504a05B567C600B78C0b41892`
- Settlement: `0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3`
- Final accounting: 200 USDG gross, 60 USDG total net debit, 60 USDG total net credit, 70% compression, zero accounted liability.
- Verification: Sourcify exact creation and runtime match.

## Differentiation

NetFold is not simply a balance calculator. Its public state machine ties each final position to debtor-approved obligations, blocks release before complete coverage, and settles all final credits atomically. It does not provide credit or mutualize a participant's default. It also makes no claim of legal netting or 70% fewer token transfers.

## Roadmap

The current product supports manual covered USDG clearing runs. Founder House work would focus on accounting and DAO treasury integrations, marketplace settlement, API-driven recurring windows, and machine-payment/x402/MPP clearing.
