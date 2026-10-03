# Hackathon Rules and Operational Constraints

Research date: 2026-10-03.

## Live HackQuest page

The current HackQuest event page shows:

- Host: Arbitrum Foundation.
- Mode: online.
- Tech stack: Solidity and Rust.
- Total prize pool: 115,000 USD.
- Overall prizes: 40,000 / 20,000 / 10,000 USDC.
- Promising Products: 7,000 / 5,000 / 3,000 USDC.
- Up to 30,000 USDC in milestone-based grants.
- Submission window shown as Sep 13, 2026 17:01 through Oct 4, 2026 15:59.
- Reward announcement shown as Oct 12, 2026 06:00.
- Existing projects are allowed, and starting from scratch is also allowed.

Qualification requirement:

- The project must be deployed on an Arbitrum chain. Examples listed by the event include Arbitrum Sepolia, Arbitrum One, and Robinhood Chain.

Published judging criteria:

1. Smart contract quality.
2. Product-market fit.
3. Innovation and creativity.
4. Real problem solving.
5. Extra consideration for Paxos USDG integration.

Prize allocation note:

- At least one of the three overall prizes is reserved for a project building on Robinhood Chain.
- At least one of the three overall prizes is reserved for a project building on Arbitrum.
- Prizes are subject to development-tied milestones.

## Deadline caution

The live HackQuest page is the operational source currently accepting submissions. A secondary project summary of an older event terms PDF reported a different earlier deadline. Direct retrieval of that terms PDF was blocked during this research, so do not treat the secondary summary as authoritative.

Practical rule: build and submit as soon as possible. Do not plan around the last minute.

## What this means for our build

The project needs a real Arbitrum deployment, not only local tests.

A narrow Solidity contract with strong tests and one clear user flow is more useful than a large unfinished product. USDG is useful because the event explicitly says it receives extra consideration, but the integration should be real and relevant to the product.

Sources are in `SOURCES.md`.
