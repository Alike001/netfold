# NetFold

NetFold is a covered USDG clearing workspace that lets stablecoin-native businesses settle mutually approved obligations by funding only their final net positions on Arbitrum.

> Settle the difference, not every obligation.

## Live application

Frontend deployment: pending. Phase 3 is currently local-only.

The public product works without a connected wallet at `/`, `/app`, `/proof`, and `/break`.

## Live Arbitrum evidence

- Network: Arbitrum Sepolia, chain ID `421614`
- NetFoldClearing: [`0x516479a53483b675Fe4629E3C63088c51cf6eFa7`](https://sepolia.arbiscan.io/address/0x516479a53483b675Fe4629E3C63088c51cf6eFa7)
- Canonical Paxos test USDG: [`0xFFC95faa3d63Cde504a05B567C600B78C0b41892`](https://sepolia.arbiscan.io/address/0xFFC95faa3d63Cde504a05B567C600B78C0b41892)
- Run #001 settlement: [`0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3`](https://sepolia.arbiscan.io/tx/0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3)
- Source verification: [Sourcify exact creation and runtime match](https://sourcify.dev/server/v2/contract/421614/0x516479a53483b675Fe4629E3C63088c51cf6eFa7?fields=all)

Run #001 proves 200 USDG of gross obligations, 60 USDG of required net settlement liquidity, and 70% gross-to-net compression.

## Local development

Requires Node.js 20.9.0 or newer.

```sh
npm install
npm run dev
```

Quality gates:

```sh
npm run lint
npm test
npm run build
```

## Architecture

- Next.js App Router and TypeScript
- Tailwind CSS v4 for the interface system
- viem types and Arbitrum Sepolia chain configuration
- wagmi injected-wallet connection and network switching
- GSAP for the explanatory netting and scroll sequences
- no database, AI service, or custom backend

The frontend imports `contracts/deployments/421614.json` and `contracts/evidence/421614-run-001.json` through one typed module: `lib/netfold-data.ts`. Live addresses, transaction hashes, balances, blocks, statuses, and explorer links are not duplicated across pages.

## Tests

The frontend suite covers six-decimal USDG formatting, compression display, address/hash truncation, evidence parsing and reconciliation, lifecycle mapping, final balances, and explorer-link generation.

The contract suite remains at 40 passing tests and 0 failures, including three fuzz campaigns at 256 runs and five invariants at 128 runs × 64 calls.

## Limitations

- Arbitrum Sepolia testnet only; testnet funds have no value.
- Unaudited and not production-ready.
- No legal-netting opinion, KYC/KYB, insurance, credit, or default mutualization.
- Single canonical test USDG settlement asset.
- Maximum 8 participants and 32 obligations per clearing run.
- Phase 3 exposes Run #001 as read-only evidence; full run creation is intentionally deferred.
- The navigation’s GitHub destination is disabled until a repository remote is configured.

Contract-specific documentation remains in [`contracts/README.md`](contracts/README.md).
