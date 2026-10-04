# NetFold

NetFold is a covered USDG clearing workspace that lets stablecoin-native businesses settle mutually approved obligations by funding only their final net positions on Arbitrum.

**Settle the difference, not every obligation.**

## Live app

- [Open NetFold](https://netfold-delta.vercel.app)
- [Explore live Run #001](https://netfold-delta.vercel.app/app)
- [Verify the settlement proof](https://netfold-delta.vercel.app/proof)
- [Review failure evidence](https://netfold-delta.vercel.app/break)

No wallet is required to inspect the public evidence.

## 30-second explanation

Three businesses have 200 USDG of mutually approved gross obligations. NetFold offsets what each participant owes against what it receives, leaving one 60 USDG net debit and two net credits totaling 60 USDG. The debtor funds that exact residual amount; nothing is released until the run is fully covered; settlement then executes atomically on Arbitrum.

**200 USDG gross → 60 USDG required net liquidity → 70% gross-to-net compression.**

## Why NetFold exists

Stablecoin-native businesses may owe each other money in both directions. Paying every invoice independently ties up more settlement liquidity than the final economic positions require. NetFold provides a transparent workspace for recording obligations, obtaining explicit debtor acceptance, freezing a run, calculating net positions, proving full coverage, and settling the residual balances.

## The 100 / 60 / 40 example

| Accepted obligation | Gross amount |
| --- | ---: |
| Studio → Auditor | 100 USDG |
| Auditor → Infrastructure | 60 USDG |
| Infrastructure → Studio | 40 USDG |
| **Total** | **200 USDG** |

After offsetting:

| Final position | Net amount |
| --- | ---: |
| Studio | Pays 60 USDG |
| Auditor | Receives 40 USDG |
| Infrastructure | Receives 20 USDG |

This is a 70% reduction from gross obligations to required settlement liquidity. It is not a claim of 70% fewer ERC-20 transfers.

## How it works

1. **Record** — the run creator records bounded USDG obligations.
2. **Accept** — each named debtor explicitly accepts what it owes.
3. **Net** — the creator closes the run and NetFold freezes the obligations and calculates final debit and credit positions.
4. **Cover** — each net debtor funds its exact finalized debit. Partial funding is not supported in V1.
5. **Settle** — once fully covered, the contract atomically releases every net credit and clears the accounted run liability.
6. **Refund on expiry** — if a closed run expires before settlement, funded debtors can recover their own covered funds.

## Live Arbitrum Sepolia evidence

Run #001 is settled on Arbitrum Sepolia, chain ID `421614`, using canonical Paxos test USDG.

- Gross obligations: `200000000` base units = 200 USDG
- Total net debit and credit: `60000000` base units = 60 USDG
- Gross-to-net compression: `7000` bps = 70%
- Final state: `SETTLED`
- Accounted run liability: `0`
- Source verification: [Sourcify exact creation and runtime match](https://sourcify.dev/server/v2/contract/421614/0x516479a53483b675Fe4629E3C63088c51cf6eFa7?fields=all)
- Machine-readable evidence: [`contracts/evidence/421614-run-001.json`](contracts/evidence/421614-run-001.json)

## Contract address

[`0x516479a53483b675Fe4629E3C63088c51cf6eFa7`](https://sepolia.arbiscan.io/address/0x516479a53483b675Fe4629E3C63088c51cf6eFa7)

## Canonical Paxos USDG address

[`0xFFC95faa3d63Cde504a05B567C600B78C0b41892`](https://sepolia.arbiscan.io/address/0xFFC95faa3d63Cde504a05B567C600B78C0b41892)

This is canonical Paxos **test** USDG on Arbitrum Sepolia. Testnet funds have no value. `MockUSDG` is used only by the local Foundry test suite.

## Settlement transaction

[`0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3`](https://sepolia.arbiscan.io/tx/0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3), block `315469249`.

## Architecture

- `contracts/src/NetFoldClearing.sol` — bounded clearing-run state machine.
- `contracts/deployments/421614.json` — committed deployment receipt.
- `contracts/evidence/421614-run-001.json` — committed live lifecycle and accounting evidence.
- Next.js App Router, TypeScript, and Tailwind CSS v4 — public product and proof surfaces.
- `lib/netfold-data.ts` — validates and normalizes the committed evidence into one typed frontend source.
- viem and wagmi — live contract reads, event discovery, injected-wallet connection, network switching, and receipt-confirmed writes.
- `/create` and `/runs/[runId]` — real run creation and role-aware obligation, funding, settlement, expiry, and refund actions.
- No database, AI service, private backend, custodial wallet, or hidden transaction signer.

## Security properties

- Only the named debtor can accept an obligation.
- Self-obligations and duplicate references are rejected.
- Closing requires every obligation to be accepted and makes the run immutable.
- Funding pulls exactly the debtor's remaining finalized net debit.
- Settlement is forbidden until the complete run is covered.
- Settlement is atomic and cannot execute twice.
- Expiry refunds return funds to the contributing debtor and cannot execute twice.
- V1 is bounded to 8 participants and 32 obligations per run.

These properties are tested but not audited. NetFold provides no credit, insurance, legal-netting opinion, or default mutualization.

## Test summary

- Frontend: 29 presentation, evidence, validation, role/action, and transaction-error tests.
- Contracts: 40 passing tests and 0 failures.
- Fuzzing: 3 campaigns × 256 runs.
- Invariants: 5 invariants × 128 runs × 64 calls.
- Live negative evidence: premature and double-settlement `eth_call` simulations revert with `InvalidRunState`.

Test counts are not a security audit.

## Local development

Requires Node.js 20.9.0 or newer and Foundry for contract checks.

```sh
npm install
npm run dev
```

```sh
npm run lint
npm test
npm run build
cd contracts && forge fmt --check && forge build && forge test
```

The public RPC defaults to `https://sepolia-rollup.arbitrum.io/rpc`. An alternate public endpoint may be supplied through `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL`; no private key is needed by the frontend.

## Known limitations

- Arbitrum Sepolia testnet only; testnet funds have no value.
- Unaudited and not production-ready.
- No legal-netting opinion, KYC/KYB, credit, insurance, FX, or default mutualization.
- Single canonical test USDG settlement asset.
- Maximum 8 participants and 32 obligations per run.
- Event-based wallet history uses a public RPC without an indexer and may become slower as chain history grows.
- Human-readable obligation references remain local browser metadata; only their hashes are stored onchain.

Contract-specific documentation is in [`contracts/README.md`](contracts/README.md).

## Roadmap

**Now**

- USDG clearing workspace
- Real multi-counterparty settlement

**Next**

- Recurring clearing windows
- Business and team workspaces
- Accounting and treasury integrations

**Founder House — Issuer Rails**

- Businesses launch branded settlement tokens backed 1:1 by USDG
- Public reserve verification
- Holder redemption into USDG
- Multi-issuer clearing through USDG

Issuer Rails is roadmap scope only. NetFold does not currently issue stablecoins or branded tokens, and no issuer contracts are included in this repository.
