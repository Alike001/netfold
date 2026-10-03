# Arbitrum Open House Singapore Context Pack

Research snapshot: 2026-10-03

Purpose: compact, source-linked context for building an Arbitrum Open House Singapore submission under a very short deadline. This folder is intentionally curated. It does not copy the whole OffchainLabs organization or Nitro source tree.

## Read order

1. `00-hackathon-rules.md`
2. `01-ecosystem-and-priorities.md`
3. `02-offchainlabs-repo-map.md`
4. `03-nitro-notes.md`
5. `04-winners-and-judging-signals.md`
6. `05-current-submissions.md`
7. `06-product-whitespace.md`
8. `07-product-spec-netfold.md`
9. `08-build-plan-24h.md`
10. `AGENTS.md`
11. `SOURCES.md`

## Short conclusion

The event is crowded with agent payment controls, tokenized-stock/RWA tools, consumer stablecoin payments, and wallet/security products. A late build should avoid those crowded shapes unless it has a very sharp technical difference.

The proposed MVP in this pack is a working title, `NetFold`: a small multilateral USDG clearing house on Arbitrum Sepolia. Businesses or DAOs record payables inside a clearing session, the contract computes each participant's net position, net debtors fund only the net amount, and the contract settles credits atomically. The demo makes gross obligations versus net settlement visible.

The product is intentionally small enough to build, test, deploy, and explain in one day.
