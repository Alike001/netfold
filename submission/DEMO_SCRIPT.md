# NetFold Demo Script

Target length: 2 minutes 30 seconds.

## 0:00–0:20 — Problem and result

Open the landing page.

“Stablecoin-native businesses often owe each other money in both directions. Paying every obligation separately makes 200 USDG of gross obligations compete for liquidity. NetFold settles the final difference: 60 USDG of required net liquidity, or 70% gross-to-net compression.”

Point to the `200 → 60 → 70%` equation and the “Explore live settlement” CTA.

## 0:20–0:40 — Usable business workspace

Open `/app`.

“NetFold is a usable business settlement workspace, not only a proof viewer. A connected wallet can create runs, discover the runs it created, and see pending obligations that require its attention.”

Point to `Create clearing run`, `Your runs`, `Needs your attention`, and the `Record → Accept → Net → Cover → Settle` lifecycle.

## 0:40–1:05 — Real run creation

Open `/create`.

“The creator chooses two to eight participants and a future funding deadline. NetFold validates the addresses and network, then submits the real `createRun` transaction. After its receipt is confirmed, the app decodes the new run ID and opens its live workspace.”

Transition to the completed production-browser Run #002 at `/runs/2`.

## 1:05–1:35 — Production-browser Run #002

Open `/runs/2`.

“This run was completed through the public Vercel product with three connected wallets. Alice owes Bob 10 USDG, Bob owes Carol 6, and Carol owes Alice 4. Each named debtor accepts its own obligation. Closing freezes the batch and produces final positions: Alice pays 6, Bob receives 4, and Carol receives 2—20 USDG gross compressed into 6 USDG of required liquidity.”

Show the accepted obligations, finalized positions, exact 6 USDG approval and coverage, `SETTLED` state, and transaction links. Explain that its confirmed receipts were independently reconstructed from Arbitrum Sepolia. Do not read hashes aloud.

## 1:35–1:55 — Canonical Run #001 proof

Open `/proof`.

“Run #001 is the canonical pre-recorded evidence path for judges who do not want testnet assets. The verified NetFold contract uses canonical Paxos test USDG. Its settlement transaction is public, the accounting reconciles, and zero accounted liability remains.”

Point to the contract, USDG, settlement transaction, and zero-liability fields. Do not read addresses or hashes aloud.

## 1:55–2:10 — Failure evidence

Open `/break`.

“The live-state `eth_call` simulations show that premature settlement and a second settlement are blocked. Separately, the Foundry suite covers failure, fuzz, and accounting-invariant cases. Simulations and tests are clearly labeled; neither is presented as a broadcast transaction or security audit.”

Keep the distinction between `LIVE ARBITRUM SIMULATION` and `FOUNDRY TEST` visible.

## 2:10–2:30 — Founder House direction

Return to the roadmap on the landing page.

“Today NetFold is a live USDG clearing workspace for real multi-counterparty settlement. Next are recurring clearing windows, business and team workspaces, and accounting integrations. At Founder House, Issuer Rails would explore branded business settlement tokens backed 1:1 by USDG, public reserve verification, redemption into USDG, and multi-issuer clearing through that common layer. Issuer Rails is unimplemented roadmap scope.”
