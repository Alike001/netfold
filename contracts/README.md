# NetFold Contracts

This workspace contains the contract-only NetFold clearing tracer bullet and guarded Arbitrum Sepolia deployment tooling.

## Scope

- Solidity and Foundry only.
- One immutable ERC-20 settlement token per deployment.
- Maximum 8 participants and 32 obligations per run.
- Coordinator-proposed, debtor-accepted obligations.
- Exact, all-or-nothing net-debtor funding.
- Atomic creditor settlement after complete coverage.
- Expiry and debtor refunds for incomplete coverage.
- A six-decimal mock token used only in local tests.

No frontend is included.

## Commands

```sh
forge fmt --check
forge build
forge test --match-contract NetFoldClearingUnitTest
forge test --match-contract NetFoldClearingFailureTest
forge test --match-contract NetFoldClearingFuzzTest
forge test --match-contract NetFoldClearingInvariantTest
forge test
```

## Local fixture

- Alice owes Bob 100 mock USDG.
- Bob owes Carol 60 mock USDG.
- Carol owes Alice 40 mock USDG.
- Gross obligations: 200 mock USDG.
- Required net funding: 60 mock USDG.
- Compression: 70%.

`MockUSDG` is test-only and must never be represented as canonical Paxos USDG.

## Arbitrum Sepolia Runbook

Network constants:

- Chain ID: `421614`
- RPC: `https://sepolia-rollup.arbitrum.io/rpc`
- Explorer: `https://sepolia.arbiscan.io`
- Canonical Paxos test USDG: `0xFFC95faa3d63Cde504a05B567C600B78C0b41892`

Create a local environment file and populate it with throwaway testnet credentials. Never commit `.env`.

```sh
cp .env.example .env
set -a
. ./.env
set +a
```

Run the read-only preflight. It contains no broadcast calls.

```sh
forge script script/Preflight.s.sol:Preflight \
  --rpc-url "$ARBITRUM_SEPOLIA_RPC_URL" -vvv
```

The full readiness report must pass before deployment. Alice needs at least `60_000_000` USDG base units, and every transaction-signing wallet needs testnet ETH.

Dry-run deployment first:

```sh
forge script script/DeployNetFold.s.sol:DeployNetFold \
  --rpc-url "$ARBITRUM_SEPOLIA_RPC_URL" -vvvv
```

Only after the dry-run succeeds, broadcast:

```sh
forge script script/DeployNetFold.s.sol:DeployNetFold \
  --rpc-url "$ARBITRUM_SEPOLIA_RPC_URL" --broadcast --slow -vvvv
```

Record the receipt-derived deployment artifact. This refuses to overwrite an existing `deployments/421614.json`.

```sh
SOURCE_VERIFICATION_STATUS=pending \
forge script script/RecordDeployment.s.sol:RecordDeployment \
  --rpc-url "$ARBITRUM_SEPOLIA_RPC_URL" -vvv
```

If an Arbiscan API key is configured, verification can be attempted independently and is not a deployment blocker:

```sh
forge verify-contract "$NETFOLD_ADDRESS" \
  src/NetFoldClearing.sol:NetFoldClearing \
  --chain 421614 \
  --constructor-args "$(cast abi-encode 'constructor(address)' 0xFFC95faa3d63Cde504a05B567C600B78C0b41892)" \
  --etherscan-api-key "$ARBISCAN_API_KEY"
```

Dry-run and then broadcast the exact Alice/Bob/Carol lifecycle:

```sh
forge script script/LiveProof.s.sol:LiveProof \
  --rpc-url "$ARBITRUM_SEPOLIA_RPC_URL" -vvvv

forge script script/LiveProof.s.sol:LiveProof \
  --rpc-url "$ARBITRUM_SEPOLIA_RPC_URL" --broadcast --slow -vvvv
```

Set `LIVE_RUN_ID` to the run ID printed by the successful broadcast, then create the receipt- and chain-validated evidence artifact. This refuses to overwrite an existing evidence file.

```sh
forge script script/RecordLiveEvidence.s.sol:RecordLiveEvidence \
  --rpc-url "$ARBITRUM_SEPOLIA_RPC_URL" -vvv
```

## Live Arbitrum Sepolia Evidence

Run 1 completed on Arbitrum Sepolia using canonical Paxos test USDG.

- NetFoldClearing: [`0x516479a53483b675Fe4629E3C63088c51cf6eFa7`](https://sepolia.arbiscan.io/address/0x516479a53483b675Fe4629E3C63088c51cf6eFa7)
- Canonical test USDG: [`0xFFC95faa3d63Cde504a05B567C600B78C0b41892`](https://sepolia.arbiscan.io/address/0xFFC95faa3d63Cde504a05B567C600B78C0b41892)
- Deployment: [`0x6bbcb9f0a32f2309d4c0e9a76fcd8c0ee000bac2232dad8097ede49115cf0cb0`](https://sepolia.arbiscan.io/tx/0x6bbcb9f0a32f2309d4c0e9a76fcd8c0ee000bac2232dad8097ede49115cf0cb0), block `315465848`
- Run creation: [`0x8d47857d448612ba23f23c3317004ec2694c81067d61dc48fa7e303d653c9781`](https://sepolia.arbiscan.io/tx/0x8d47857d448612ba23f23c3317004ec2694c81067d61dc48fa7e303d653c9781)
- Proposals: [`Alice → Bob`](https://sepolia.arbiscan.io/tx/0xdbf7afa8fc8cff5d3fa10a4e43b88f1502756aa32972520cc22ae8a7123a2c2f), [`Bob → Carol`](https://sepolia.arbiscan.io/tx/0x0fad7b50a7444382362a6df0a1dd2a68c19d39a0c8633416b14b856b68b696e6), [`Carol → Alice`](https://sepolia.arbiscan.io/tx/0x4e9eba38e98a54cf4bdbbda696b68290099f99cd7cb1c87f6a97a4b7e18d9ab5)
- Acceptances: [`Alice`](https://sepolia.arbiscan.io/tx/0xf0417d6cfe0533065d73b876ab93b53ed28c00772c464ce5753cd5be8a11e9ff), [`Bob`](https://sepolia.arbiscan.io/tx/0x64ade7219f0ffad333dd28579b1f678afe1e6e12171e4b0954b713f2640297d6), [`Carol`](https://sepolia.arbiscan.io/tx/0x220504cbbc7c9b125a38affdce617da2616c607be3cf3824264870ee0eb348a3)
- Close: [`0x8e6c80d55e5bb4abfd820ff48f613794603157b0c523eef69087dda4411c3f5f`](https://sepolia.arbiscan.io/tx/0x8e6c80d55e5bb4abfd820ff48f613794603157b0c523eef69087dda4411c3f5f)
- Exact 60 USDG approval: [`0x4e027ec8abe0c3abc9bb05d0ecf627b48114563818089eecc24265a4c1b28c82`](https://sepolia.arbiscan.io/tx/0x4e027ec8abe0c3abc9bb05d0ecf627b48114563818089eecc24265a4c1b28c82)
- Funding: [`0xccdbb24d59b53ec0e5d2d80f58ca9113020bcb2fe5e14593f174fbcdeeed818f`](https://sepolia.arbiscan.io/tx/0xccdbb24d59b53ec0e5d2d80f58ca9113020bcb2fe5e14593f174fbcdeeed818f)
- Settlement: [`0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3`](https://sepolia.arbiscan.io/tx/0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3), block `315469249`

The accepted obligations totalled `200_000_000` base units. Net settlement required `60_000_000` units: Alice funded 60 USDG, Bob received 40 USDG, and Carol received 20 USDG, producing `7000` bps (70%) compression. Premature and repeat settlement both reverted with `InvalidRunState` in non-broadcast simulations. Receipt hashes, historical balances, reference hashes, and accounting results are preserved in `deployments/421614.json` and `evidence/421614-run-001.json`. Source verification is pending because no Arbiscan API credential was available.

This project is:

- Arbitrum Sepolia testnet only;
- unaudited;
- configured to use canonical Paxos test USDG on Arbitrum Sepolia;
- not a legal-netting service;
- not a credit facility and does not provide default mutualization;
- using testnet funds that have no value;
- not production-ready.
