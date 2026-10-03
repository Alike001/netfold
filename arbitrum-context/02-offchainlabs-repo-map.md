# OffchainLabs Repository Map

This is a curated map of repositories that matter to an application builder. The full OffchainLabs organization is much larger.

## Tier 1: directly useful

### `OffchainLabs/arbitrum-docs`

Purpose: source for Arbitrum developer documentation.

Use it for:

- network behavior;
- chain information;
- Solidity deployment guidance;
- precompiles;
- gas and transaction behavior;
- Stylus and chain-specific developer guidance.

### `OffchainLabs/arbitrum-sdk`

Current README describes `@arbitrum/sdk` v4.

Useful for:

- bridging ETH and ERC-20s;
- parent-to-child and child-to-parent messages;
- Arbitrum network configuration;
- custom Arbitrum networks.

For the proposed NetFold MVP, the SDK is optional because a simple Arbitrum Sepolia dApp can use viem/wagmi directly.

### `OffchainLabs/nitro-contracts`

Purpose: contracts that power Arbitrum Nitro, including rollup/fraud-proof contracts and precompile interfaces.

Use it as protocol reference. Do not import it merely to make a normal dApp appear more 'Arbitrum-native'.

### `OffchainLabs/arbitrum-mpp`

Purpose: Machine Payments Protocol implementation for Arbitrum.

README structure:

- client `Charge` creates a payment credential from a server challenge;
- server `Charge` defines the challenge, validates the credential, submits the transaction, and verifies payment.

Important limitation for our planning: the README's local test text currently says compatible ERC-20 and specifically notes USDC. Do not assume the package supports canonical USDG without checking the code and tests.

The latest commits found during research are from June 2026. They include Permit2, Arbitrum One/Sepolia restrictions, transaction simulation, transfer log checks, tamper tests, and CI hardening.

## Tier 2: useful only for certain builds

### `OffchainLabs/nitro-devnode`

Starts a local Nitro dev node and prepares Stylus cache-manager support.

Useful when:

- testing Stylus locally;
- testing chain-level behavior;
- running Arbitrum SDK integration tests.

Not necessary for a straightforward Solidity app deployed to Arbitrum Sepolia.

### `OffchainLabs/token-bridge-contracts`

Use when implementing or studying canonical bridge behavior.

### `OffchainLabs/arbitrum-token-bridge`

Frontend and bridge-related implementation reference.

### `OffchainLabs/arbitrum-chain-sdk`

Useful for teams launching or managing custom Arbitrum chains. Not relevant to this one-day MVP.

### Stylus repositories

Relevant examples include `stylus-sdk-rs`, `stylus-by-example`, and `stylus-hello-world`.

Stylus is powerful, but adding Rust only for novelty creates delivery risk in this sprint. Use Solidity unless a core operation genuinely benefits from Stylus.

## Tier 3: protocol/operator repositories

Examples include Nitro node, monitoring, validator tooling and chain actions. These are important to operators but mostly irrelevant to the application MVP.

## Key rule

Do not clone the entire OffchainLabs organization into project context. Give Codex only the small set of facts needed to build the product correctly.
