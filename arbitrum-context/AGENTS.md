# Coding Agent Instructions

Read every file in `arbitrum-context/` before implementing product code.

## Goal

Ship a small, reproducible Arbitrum Open House Singapore MVP before the submission window closes.

Current working product spec: `07-product-spec-netfold.md`.

## Hard constraints

- Target Arbitrum Sepolia, chain id `421614`.
- Canonical Paxos USDG testnet address: `0xFFC95faa3d63Cde504a05B567C600B78C0b41892`.
- Solidity first. Do not introduce Stylus unless explicitly requested later.
- Foundry for contract tests unless the project already has a stronger compatible setup.
- Use OpenZeppelin primitives where appropriate.
- No private keys, API secrets or seed phrases in source, logs, fixtures or docs.
- No fake transaction hashes or fake deployment evidence.
- No claims that mocks are canonical USDG.
- Keep the public contract surface small.
- Prefer explicit state machines and bounded arrays over complex abstractions.
- Every write path needs a negative test.
- Add fuzz/invariant tests for value conservation and netting math.
- Commit at the end of each completed phase with a clear conventional commit message.
- Stop and report blockers instead of hiding them with mocks or hardcoded fake success.

## Product constraints

Do not add AI, agents, x402, MPP, account abstraction, a custom Arbitrum chain, bridges, lending, credit, fiat settlement, governance tokens, or a dispute system in v1.

The differentiator is multilateral obligation netting plus verifiable USDG settlement.

## Required proof

Before calling the project submission-ready, report:

- git diff/status;
- contract test summary;
- frontend test/build summary;
- deployed chain id;
- settlement-token address;
- contract address;
- deployment transaction hash;
- one completed clearing-session transaction trail if test USDG is available;
- exact known limitations.
