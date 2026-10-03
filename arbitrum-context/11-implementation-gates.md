# NetFold Implementation Gates

## Gate 0 - environment and token access

Confirm:

- Foundry installed
- Arbitrum Sepolia RPC works
- deployer has Sepolia ETH
- canonical USDG address configured: 0xFFC95faa3d63Cde504a05B567C600B78C0b41892
- determine whether canonical test USDG can be acquired for live settlement

Do not block unit tests on USDG availability. Use a 6-decimal mock locally and switch only the deployment token address.

## Gate 1 - tracer bullet contract

One contract and one fixed fixture.

Lifecycle:

OPEN -> CLOSED -> COVERED -> SETTLED
             \
              -> EXPIRED/CANCELLED -> REFUNDED

Required fixture:

A -> B 100
B -> C 60
C -> A 40

Expected positions:
A -60
B +40
C +20

Expected gross = 200
Expected net funding = 60
Expected compression = 70%

No frontend before this passes.

## Gate 2 - contract hardening

Test:

- balance conservation
- sum of positions == 0
- exact net position math
- only valid state transitions
- replay/duplicate protection
- debtor authorization
- participant bounds
- zero/invalid amount rejection
- funding accounting
- settlement accounting
- timeout refund
- settle-once invariant
- no stranded USDG after successful settlement or completed refunds

Add fuzz tests around arbitrary bounded obligation graphs.

## Gate 3 - Arbitrum Sepolia

Deploy the contract wired to canonical test USDG.

Verify source on Arbiscan if time permits.

Exercise at least one real transaction path and preserve tx hashes.

If canonical test USDG funding cannot be sourced, state that honestly. Do not relabel a mock as Paxos USDG.

## Gate 4 - frontend

Next.js + viem/wagmi.

Only these surfaces are required:

- landing
- workspace
- run detail/proof
- break-it/security page

Seeded demo mode must be available without a wallet, while live mode reads the deployed contract.

## Gate 5 - submission proof

README must contain:

- one-line product statement
- problem and target user
- exact Arbitrum deployment
- USDG address
- transaction proof
- test commands and counts
- architecture
- security model
- honest limitations
- 2-minute judge walkthrough
- roadmap and Founder House continuation plan
