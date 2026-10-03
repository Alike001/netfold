# 24-Hour Build Plan

The order is strict. Do not start UI polish before the contract is correct.

## Phase 0: repository and evidence skeleton

Create:

- `contracts/`
- `web/`
- `docs/`
- `deployments/`
- root README
- `.env.example`
- CI workflow if it is fast to add

Commit immediately.

## Phase 1: contract tracer bullet

Implement the smallest complete lifecycle with a mock ERC-20 first:

1. create session;
2. add obligations;
3. close and compute net positions;
4. fund net debtors;
5. settle;
6. withdraw credits.

Use the A/B/C 100/60/40 fixture from day one.

Do not write the frontend until this lifecycle passes.

## Phase 2: tests

Target quality over raw count.

Suggested suites:

- session creation and membership;
- obligation validation;
- state transition guards;
- net calculation examples;
- fuzz tests for random obligation amounts;
- funding rules;
- settlement and withdrawals;
- double-withdraw protection;
- cancellation before close;
- no mutation after close;
- invariant/conservation tests.

A realistic target is 25 to 40 meaningful tests.

## Phase 3: canonical USDG integration

Configure Arbitrum Sepolia deployment with:

`0xFFC95faa3d63Cde504a05B567C600B78C0b41892`

Before broadcasting:

- verify chain id 421614;
- verify `eth_getCode` is non-empty at the USDG address;
- read name/symbol/decimals if supported;
- never expose the deployer private key in logs or source.

Deploy `NettingHouse` with the USDG address.

If test USDG is available, exercise the complete A/B/C flow live. Paxos documentation points to its Testnet Faucet / Sandbox process for test assets.

If test USDG cannot be acquired in time, keep claims exact: canonical USDG-configured deployment plus local/fork tests. Do not claim a live USDG transfer that did not happen.

## Phase 4: frontend

Build only what proves the contract:

- connect wallet;
- create/select demo session;
- add obligations;
- show obligation graph/table;
- show computed gross and net numbers;
- fund;
- settle;
- withdraw;
- link every relevant transaction to Arbiscan.

Add a read-only judge mode if wallet state makes reproduction awkward.

## Phase 5: proof and submission

README should contain:

- one sentence;
- problem;
- why onchain;
- why Arbitrum;
- architecture;
- exact deployment addresses;
- test commands and results;
- security properties;
- known limitations;
- 60-second judge path.

Record the demo only after the deployed flow is stable.

## Stop conditions

Do not add features if any of these is still missing:

- green contract tests;
- successful production frontend build;
- Arbitrum Sepolia deployment;
- judge-friendly README;
- reproducible demo path;
- transaction evidence.
