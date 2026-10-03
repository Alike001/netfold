# Current Singapore Submission Map

This is not an exhaustive gallery. It is a competitive sample collected from public HackQuest pages and public GitHub repositories on 2026-10-03.

## Agent payment / agent control is crowded

### VeriPay

Agent payment account with budget limits, merchant allowlists, per-payment caps, expiration, immediate revoke, session-key rotation and EIP-712 authorization.

Direct implication: do not build a generic bounded agent payment vault.

### Kajota Mesh

Agent-commerce settlement primitive with escrow, N-party splits, x402-style deposits, agent identity links, USDC and USDG, plus deployments on Arbitrum Sepolia and Robinhood testnet.

Direct implication: a simple agent escrow or commission splitter will look weaker.

### AgentGuard VerifyPay

Policy escrow for agent-to-agent tasks with result evidence, verification and payment release.

### Signal402

Paid AI market-intelligence reports using an x402 payment gate on Arbitrum.

### Intendd

Self-custodial passkey account with onchain mandates and policy controls for agentic financial actions.

## RWA and tokenized-stock tooling is crowded

Examples found include:

- Batpilot: stock-token DCA/protection vaults, oracle guards and Stylus components.
- AfterHours: weekend-gap protection for tokenized equities with a Stylus pricing engine.
- Custos: oracle-safety tooling for 24/7 tokenized stock markets versus 24/5 feeds.
- Vetted: token verification and guarded swaps on Robinhood Chain.
- Arbora: onchain credit scoring and undercollateralized lending settled in USDG.

Direct implication: do not start a generic RWA dashboard, oracle guard, DCA vault or stock-token safety product now.

## Consumer payments and savings are also represented

### TakumiPay

USDG to Indonesian QRIS merchant payments, with passkeys and deployments across Arbitrum and Robinhood testnet.

### NairaFlow

Stablecoin savings circles and goal vaults, including scoped automation.

Direct implication: a late generic remittance, savings or 'pay with stablecoins' app needs a very specific new wedge.

## Security / verification is represented

Examples include Zeus Guard, ArbGuard, VeriAgent, NOMEN and VeraKey.

## Whitespace found in targeted search

Targeted public searches for multilateral netting, clearing, accounts payable/receivable and stablecoin invoice reconciliation did not surface a close Singapore submission in this research pass.

That is not proof that none exists. It is enough to justify exploring a small B2B clearing product because it is less obviously crowded than agent payments or RWA safety.
