# NetFold Demo Script

Target length: 2 minutes 30 seconds.

## 0:00–0:20 — Problem and result

Open the landing page.

“Stablecoin-native businesses often owe each other money in both directions. Paying every obligation separately makes 200 USDG of gross obligations compete for liquidity. NetFold settles the final difference: 60 USDG of required net liquidity, or 70% gross-to-net compression.”

Point to the `200 → 60 → 70%` equation and the “Explore live settlement” CTA.

## 0:20–0:50 — Obligations and acceptance

Open `/app`.

“Run #001 contains three obligations: Studio owes Auditor 100, Auditor owes Infrastructure 60, and Infrastructure owes Studio 40. Each obligation is accepted by its named debtor. Acceptance matters because nobody else can commit a debtor to an amount.”

Show the three `ACCEPTED` cards and briefly indicate their proposal and acceptance evidence links. Do not read hashes aloud.

## 0:50–1:20 — Net positions and full coverage

Point to the net-position panel.

“After offsetting what each party owes and receives, Studio pays 60, Auditor receives 40, and Infrastructure receives 20. The run is closed and immutable. Studio then funds exactly 60 USDG. NetFold blocks settlement until the complete run is covered.”

Show the lifecycle: `CREATED → ACCEPTED → CLOSED → COVERED → SETTLED`.

## 1:20–1:50 — Live Arbitrum proof

Open `/proof`.

“This is live Arbitrum Sepolia evidence using canonical Paxos test USDG. The deployed contract, token, and settlement transaction all link to Arbiscan. The accounting reconciles: 60 funded, 40 paid to Auditor, 20 paid to Infrastructure, and zero accounted liability remains.”

Open the settlement transaction only if time allows. Do not read addresses or hashes aloud.

## 1:50–2:10 — Failure evidence

Open `/break`.

“The live-state simulations show that settlement before coverage and settlement a second time both revert with `InvalidRunState`. Separately, 40 Foundry tests cover failure, fuzz, and accounting-invariant cases. These tests are engineering evidence, not a security audit.”

Keep the distinction between `LIVE ARBITRUM SIMULATION` and `FOUNDRY TEST` visible.

## 2:10–2:30 — Founder House direction

Return to the roadmap on the landing page.

“Today NetFold supports manual covered USDG clearing runs. At Founder House, I would connect it to accounting systems, DAO treasuries, marketplaces, recurring clearing APIs, and machine-payment flows such as x402 and MPP. The goal is a practical clearing layer for stablecoin-native operations.”
