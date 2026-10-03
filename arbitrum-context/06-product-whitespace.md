# Product Whitespace Decision

## Avoid

Do not spend this sprint on:

- generic AI agent wallets;
- spending-cap vaults;
- x402 API paywalls;
- agent escrow marketplaces;
- tokenized-stock oracle guards;
- RWA DCA vaults;
- generic consumer stablecoin payments;
- social savings circles;
- another wallet/passkey abstraction product;
- a custom Arbitrum chain.

Public submissions already cover those shapes with substantial test suites and live deployments.

## Better wedge: B2B stablecoin clearing

Working concept: businesses, DAOs, agencies and service providers often owe each other money in both directions during a settlement period. Paying every invoice separately creates gross settlement volume and forces more working capital to move than the final net economic position requires.

Example:

- A owes B 100 USDG.
- B owes C 60 USDG.
- C owes A 40 USDG.

Gross obligations: 200 USDG.

Net positions:

- A: -60
- B: +40
- C: +20

Only 60 USDG of net debtor funding is required to settle the 200 USDG gross obligation set.

## Why an onchain system is justified

The useful part is not putting invoices onchain for decoration. The useful part is a shared settlement state that all participants can verify:

- obligation references cannot be silently rewritten after a clearing session closes;
- net positions are deterministically calculated from the same public obligation set;
- funding and settlement follow a contract state machine;
- the contract can enforce conservation of value;
- settlement evidence is public and independently replayable;
- no participant has to trust one company's spreadsheet as the final clearing record.

## Why Arbitrum

The product benefits from cheap EVM execution, stablecoin settlement, and an ecosystem focused on programmable finance. Canonical USDG gives the product a stable settlement asset and aligns with the event's explicit USDG signal.

## Main risk

Netting is a financial primitive, and production deployments can carry legal, credit and insolvency considerations. The hackathon MVP should explicitly be a prefunded clearing prototype, not unsecured credit or a regulated clearing service.

Prefunding keeps the contract model simple and prevents a participant from creating an uncollateralized settlement deficit.
