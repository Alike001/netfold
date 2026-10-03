# NetFold UX Blueprint

## Product rule

The judge must understand the product before connecting a wallet.

## Landing

Hero:

> Settle the difference, not every invoice.
>
> NetFold compresses a network of USDG obligations into one covered settlement on Arbitrum.

Show a live visual before/after example immediately:

Before:
Studio -> Auditor 100
Auditor -> Infra 60
Infra -> Studio 40
Gross = 200 USDG

After:
Studio -> NetFold 60
NetFold -> Auditor 40
NetFold -> Infra 20
Funding needed = 60 USDG
70% less settlement movement

Primary CTA: "Open demo workspace"
Secondary CTA: "Verify on Arbitrum"

## Workspace

Use a four-step lifecycle:

1. Obligations
2. Netting Preview
3. Coverage
4. Settlement Proof

Persistent top metrics:

- Gross obligations
- Net funding required
- USDG movement avoided
- Compression percentage
- Run state

## Obligations screen

Table fields:

- payer
- payee
- amount USDG
- invoice/reference hash
- acceptance status

Beside the table show a simple directed graph. Keep the graph readable for the three-party demo.

## Netting Preview

The strongest visual in the product.

Show side-by-side:

Gross network -> Net positions

Each participant card shows:

- gross sent
- gross received
- net result
- status: PAY / RECEIVE / FLAT

Do not require Web3 vocabulary to understand the screen.

## Coverage

Show only net debtors.

Example:

Studio
Needs to cover: 60 USDG
Funded: 60 USDG
Status: COVERED

Settlement button remains disabled until every debtor is covered.

## Settlement Proof

Show:

- run ID
- contract
- Arbitrum Sepolia
- canonical Paxos USDG address
- gross amount
- net settled amount
- compression percentage
- participant payouts
- transaction hash / Arbiscan link
- state transition timeline

## Judge Mode

Borrow the strongest UX patterns found in good hackathon repos:

- Clasp: "Verify it yourself" plus attack/security lab
- NimQuest: "Try it in 2 minutes" and a linear product journey
- Phoenix Audit: evidence artifact and explicit judge mapping
- BlindMarkets: lifecycle console and recovery states
- Remlo: real settlement receipts and separate user surfaces
- Fangorn: keep on-chain responsibilities small and explicit

Add a "Break NetFold" page with deterministic failure demonstrations:

- settle before coverage -> blocked
- duplicate obligation -> blocked
- wrong debtor tries to fund -> blocked
- fund after cancel -> blocked
- settle twice -> blocked
- non-participant mutation -> blocked

## Honest limits card

Testnet prototype. No legal netting opinion. No KYC/KYB. No credit extension. No FX. No default fund. Single USDG asset. Bounded participant count for the MVP.
