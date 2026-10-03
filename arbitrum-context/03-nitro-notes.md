# Nitro Notes for an Application Developer

## What Nitro is

`OffchainLabs/nitro` describes Nitro as a complete optimistic-rollup system that includes fraud proofs, sequencing, token bridging, calldata compression and the machinery required to run an Arbitrum L2.

A useful simplified architecture:

1. Ethereum is the parent settlement/data layer for Arbitrum One.
2. The sequencer orders L2 transactions for fast user experience.
3. The Nitro execution engine incorporates Geth for EVM compatibility.
4. ArbOS supplies Arbitrum-specific L2 functions such as cross-chain communication and batching/compression behavior.
5. The system has a WASM-based fraud-proof path.

For a dApp, the most important result is strong Ethereum compatibility. Build ordinary EVM contracts and account for Arbitrum-specific network details only where needed.

## Current release snapshot

GitHub's latest Nitro release during this research was `v3.12.1`, published Oct 2, 2026.

Selected release changes:

- feed clients can fill gaps from a REST backlog;
- new feed input REST configuration and metrics;
- a breaking change makes Stylus activation through `eth_call` / `eth_estimateGas` refused by default unless offchain activation is explicitly allowed;
- fixes for `debug_traceCall` and `eth_simulateV1` on chains that collect tips.

These changes matter to node operators and Stylus tooling more than to a simple Solidity app.

## Repository layout signals

The Nitro root currently contains protocol/operator areas such as:

- `arbnode`
- `arbos`
- `precompiles`
- `staker`
- `validator`
- `transactionfeed`
- `timeboost`
- `system_tests`
- `nitro-reth`

That layout reinforces the distinction between protocol code and application code.

## Nitro's own AGENTS.md

Nitro includes coding-agent guidance. Current pitfalls listed there include:

- Go builds may require generated contract bindings first, using `make contracts`;
- system tests require test dependencies first, using `make test-go-deps`;
- Nitro PRs require a changelog file.

These instructions apply when changing Nitro itself. They are not requirements for our app repository.

## What not to do for the hackathon

Do not fork or modify Nitro merely to claim deeper Arbitrum integration.

Do not run a custom Arbitrum chain for this sprint unless the product fundamentally requires a dedicated chain.

Do not add Stylus unless it creates a clear product or performance benefit that can be demonstrated.
