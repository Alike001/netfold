# NetFold Contracts

Phase 1 contains the contract-only NetFold clearing tracer bullet.

## Scope

- Solidity and Foundry only.
- One immutable ERC-20 settlement token per deployment.
- Maximum 8 participants and 32 obligations per run.
- Coordinator-proposed, debtor-accepted obligations.
- Exact, all-or-nothing net-debtor funding.
- Atomic creditor settlement after complete coverage.
- Expiry and debtor refunds for incomplete coverage.
- A six-decimal mock token used only in local tests.

No frontend or deployment scripts are included in this phase.

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
