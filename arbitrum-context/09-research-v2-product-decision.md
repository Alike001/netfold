# Research V2: Product Decision

## Decision

Do not build a generic stablecoin clearing simulator.

Build **NetFold: a covered USDG clearing workspace for recurring business obligations on Arbitrum**.

The first user is a small stablecoin-native network such as Web3 agencies, infrastructure providers, auditors, DAOs, market makers, or service businesses that repeatedly owe each other money.

Each obligation is debtor-authorized. A clearing run closes, computes one net position per participant, requires every net debtor to fully cover its residual in USDG, and only then releases net credits. If coverage never completes before the deadline, funded debtors can recover their funds.

## Why the product changed

A generic clearing demo is already represented by open-source projects such as:

- siva-sub/Stablecoin-Clearing-and-Settlement-Engine, Ethereum Sepolia
- cycles-money/Prime-Design-concept, B2B clearing prototype
- Von-Labs/cyrix-network, Stacks cycle clearing
- commercial/institutional efforts such as ClearToken, TetraFi, SettleX, Cycles and NETTA

The technical primitive is validated. The hackathon differentiation must come from the product wedge, trust model, USDG integration, user experience, and proof of real Arbitrum execution.

## NetFold one-liner

NetFold turns a batch of mutually approved USDG obligations into one covered net settlement on Arbitrum, so participants fund only what they truly owe after offsets.

## Demo fixture

- Studio owes Auditor: 100 USDG
- Auditor owes Infra: 60 USDG
- Infra owes Studio: 40 USDG
- Gross obligations: 200 USDG
- Net positions: Studio pays 60, Auditor receives 40, Infra receives 20
- Required settlement liquidity: 60 USDG
- Gross movement avoided: 140 USDG
- Compression: 70%

## Trust model

The MVP should not pretend to provide legal netting, KYC, credit guarantees or default mutualization.

On-chain guarantees should be limited to:

1. An obligation cannot be silently edited after acceptance.
2. A run cannot settle unless all net debit is covered.
3. Total debits equal total credits.
4. A participant cannot receive more than the computed net credit.
5. A failed or expired uncovered run can return funded balances.
6. The USDG token address is fixed by deployment configuration.
7. Settlement state transitions are irreversible and observable.

## Product roadmap after the hackathon

- signed EIP-712 obligation imports from accounting/AP systems
- CSV/API ingestion
- recurring clearing windows
- participant and counterparty policy controls
- MPP/x402 ingestion for machine-payment obligations
- multi-asset and cross-chain netting only after the single-asset design is proven
