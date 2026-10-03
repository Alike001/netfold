# Product Spec: NetFold

Working name only. Rename after the MVP works.

## One sentence

NetFold is a prefunded USDG clearing house on Arbitrum that nets a batch of B2B obligations and settles only each participant's final net position.

## User

Primary MVP user: small teams, DAOs, agencies, market makers, service networks or businesses that repeatedly settle stablecoin payables with a known group of counterparties.

## Problem

Repeated counterparties often create circular or offsetting payables. Settling each invoice one by one moves the gross amount, requires more working capital, and leaves reconciliation split across wallets, spreadsheets and invoice systems.

## Core demo

Three entities participate in one clearing session:

- A owes B 100 USDG.
- B owes C 60 USDG.
- C owes A 40 USDG.

The UI shows:

- gross obligation amount: 200 USDG;
- net funding required: 60 USDG;
- A funds 60 USDG;
- B receives 40 USDG;
- C receives 20 USDG;
- all three source obligations become SETTLED in one clearing lifecycle.

## Contract: `NettingHouse.sol`

Use Solidity + Foundry + OpenZeppelin `SafeERC20` and `ReentrancyGuard`.

Settlement token is immutable and set to canonical Paxos USDG for the deployed instance.

### Session states

- OPEN
- CLOSED
- FUNDED
- SETTLED
- CANCELLED

### Data

`Session`

- creator
- state
- participant list
- obligation ids
- grossAmount
- totalNetDebit
- createdAt
- closedAt
- settledAt

`Obligation`

- id
- sessionId
- payer
- payee
- amount
- referenceHash
- createdAt
- settled

`Position`

- signed net amount or separate debit/credit fields
- funded amount
- withdrawn amount

### Functions

Minimum intended surface:

- `createSession(address[] participants)`
- `addObligation(sessionId, payee, amount, referenceHash)` called by the payer
- `cancelObligation(...)` only while OPEN and before close
- `closeSession(sessionId)` computes deterministic net positions
- `requiredFunding(sessionId, participant)` view
- `fund(sessionId, amount)` only up to required net debit
- `settle(sessionId)` after every debtor is fully funded
- `withdrawCredit(sessionId)` after settlement
- read helpers for sessions, obligations and positions

### Bounded design

Set explicit MVP limits such as:

- 2 to 8 participants per session;
- maximum 32 obligations per session;
- no zero-value obligations;
- payer and payee must differ;
- both addresses must belong to the session.

These bounds make onchain iteration predictable and give tests clear gas/security limits.

### Invariants

At minimum, prove with unit/fuzz/invariant tests:

1. Sum of all net positions is zero after close.
2. Total net debit equals total net credit.
3. `totalNetDebit <= grossAmount`.
4. A session cannot settle until all net debtors are fully funded.
5. No participant can withdraw more than its net credit.
6. One obligation cannot be settled twice.
7. Session data cannot change after close.
8. Contract USDG outflows cannot exceed funded settlement balances.
9. Reentrancy cannot double-withdraw.
10. Only canonical configured settlement token is accepted.

## Frontend

Next.js or Vite React, wagmi + viem.

Keep the interface to three views:

1. Landing / judge page.
2. Clearing session workspace.
3. Proof / transaction page.

The landing page must explain the core value with the 200 gross -> 60 net example before asking a judge to connect a wallet.

## Evidence page

Show:

- chain ID;
- NettingHouse address;
- USDG address;
- deployment tx;
- test count;
- session id;
- close/fund/settle tx links;
- gross amount;
- net amount;
- capital reduction percentage;
- contract source link if verified.

## Explicit non-goals

Do not add:

- AI;
- credit scoring;
- lending;
- fiat rails;
- dispute arbitration;
- custom chain;
- bridge UI;
- account abstraction;
- Stylus;
- recurring subscriptions;
- governance token.

Each one increases risk without improving the 30-second product story.

## Success condition

The product is submission-ready when a judge can reproduce one complete testnet session and independently verify the state transition and settlement values on Arbitrum Sepolia.
