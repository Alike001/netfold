# Production-Browser Acceptance — Run #002

Status: **COMPLETE — RECEIPTS AND FINAL STATE VERIFIED**

This run was executed through the production frontend at https://netfold-delta.vercel.app using Alice, Bob, and Carol wallets. It was not executed with Foundry scripts or private-key automation. The resulting receipts were reconstructed independently through read-only Arbitrum Sepolia RPC calls.

## Read-only readiness

- Network: Arbitrum Sepolia (`421614`)
- NetFold: `0x516479a53483b675Fe4629E3C63088c51cf6eFa7`
- Canonical Paxos test USDG: `0xFFC95faa3d63Cde504a05B567C600B78C0b41892`
- Current `nextRunId` at preparation time: `2`
- Alice canonical test USDG at preparation time: `140000000` base units = 140 USDG
- Alice, Bob, and Carol had nonzero Arbitrum Sepolia ETH balances at preparation time

Readiness values are preflight observations, not Run #002 transaction evidence.

## Wallet roles

- Alice / Studio / creator: `0x9Ef29De25594f88eB51D45Ed9547Bc6463Edbfc6`
- Bob / Auditor: `0x96f11f708b9e731a99d35AF50195b6BaD487c832`
- Carol / Infrastructure: `0x41675e5219b263500AD1Fd11B7e8a6c611075358`

## Fixture and expected accounting

| Obligation | Amount |
| --- | ---: |
| Alice → Bob | 10 USDG |
| Bob → Carol | 6 USDG |
| Carol → Alice | 4 USDG |
| **Gross** | **20 USDG** |

Expected finalized positions:

- Alice: pay 6 USDG
- Bob: receive 4 USDG
- Carol: receive 2 USDG
- Total net debit: 6 USDG
- Total net credit: 6 USDG
- Required settlement liquidity: 6 USDG
- Compression: 70% (`7000` bps)

## Browser execution sequence

1. Open `/create` in production and connect Alice on Arbitrum Sepolia.
2. Use Alice, Bob, and Carol as the three unique participants. Choose a comfortably future funding deadline.
3. Confirm `createRun` in Alice's wallet. Wait for the receipt and confirm the app opens `/runs/2`.
4. As Alice, propose the three obligations with unique references such as `NF-RUN-002-A-B`, `NF-RUN-002-B-C`, and `NF-RUN-002-C-A`.
5. Copy Bob's pending acceptance link. Open it with Bob connected and accept only Bob → Carol.
6. Copy Carol's pending acceptance link. Open it with Carol connected and accept only Carol → Alice.
7. Reconnect Alice and accept only Alice → Bob.
8. As Alice, confirm all three active obligations show `ACCEPTED`, then close the run.
9. **Stop before funding if any finalized value differs from the expected accounting above.**
10. Record Alice's USDG balance, NetFold's USDG balance, and the exact required funding shown by the app.
11. As Alice, approve exactly 6 USDG (`6000000` base units) to NetFold. Do not approve unlimited USDG.
12. After the approval receipt, call `fund(2)` through the app. Confirm `COVERED`, total funded 6 USDG, and zero shortfall.
13. Record Alice, Bob, Carol, and NetFold USDG balances immediately before settlement.
14. With any connected wallet, call `settleRun(2)` through the app and wait for its receipt.
15. Confirm `SETTLED`, Bob increased by exactly 4 USDG, Carol increased by exactly 2 USDG, and the run's accounted liability is cleared.
16. Open every receipt on Sepolia Arbiscan and retain the transaction hash and block number.

## Verified evidence

- [x] Run ID `2`
- [x] Creation transaction and block
- [x] Three proposal transactions and blocks
- [x] Three acceptance transactions and blocks
- [x] Close transaction and block
- [x] Exact 6 USDG approval transaction and block
- [x] Funding transaction and block
- [x] Settlement transaction and block
- [x] Obligation IDs `4`, `5`, and `6` and their onchain reference hashes
- [x] Final gross, debit, credit, funded amount, compression, and state
- [x] Alice, Bob, Carol, and NetFold balances immediately before settlement
- [x] Alice, Bob, Carol, and NetFold balances after settlement

The complete machine-readable reconstruction is in [`contracts/evidence/421614-run-002.json`](../contracts/evidence/421614-run-002.json). Human reference labels in that artifact are explicitly marked as offchain/local metadata; the contract stores only their `bytes32` hashes.

Settlement transaction: [`0xf173ecfc0232412a0e25ccc4d455819c10a50a3f424d3002c85af78a10bb845f`](https://sepolia.arbiscan.io/tx/0xf173ecfc0232412a0e25ccc4d455819c10a50a3f424d3002c85af78a10bb845f), block `315512050`.

### Confirmed transaction sequence

| Action | Transaction | Block | Sender |
| --- | --- | ---: | --- |
| Create run | `0x25b99c8e6a18f5908f8be73825963b4ec1d76c73246242bc0b080337e5026699` | 315504823 | Alice |
| Propose obligation 4 | `0xc64461dc2910076056e022c5ca210eb7bbe60f00f7d670cc60d656481039cf53` | 315505442 | Alice |
| Propose obligation 5 | `0x994211f9fb7320cbda740191e5d4bc093c81b0ee110b31d8bda235d2a8ba2aa5` | 315505930 | Alice |
| Propose obligation 6 | `0xff9efa6d5550a6e39f5a2029eef856cc00968e8b99dffbdb35bce1039dcb7b94` | 315506524 | Alice |
| Accept obligation 5 | `0x26cef4c99a71beb24e8e843496f3bb3fc0f70576dcaf84304187471d333aa1aa` | 315507137 | Bob |
| Accept obligation 6 | `0x0f6becd16ac0c43c4a070655f46c544ada003bedce0ff264ef872bab1e4cd78d` | 315507670 | Carol |
| Accept obligation 4 | `0xf32aff5eaca4f1d14d846933555167d4c8550c3d5ababe4ea194029fda2916e8` | 315509680 | Alice |
| Close run | `0x60a837a2ecc981adbce4124971bd7a73d42d72fac96bd9cbc4fe822bc7a89453` | 315510208 | Alice |
| Approve exact 6 USDG | `0x461ead3757097e594a816ddb91886966207528d3d4e7d57ce958d83d4d721bea` | 315511042 | Alice |
| Fund run | `0xe05f880257b0ab335c76339ce7606d9db0356a166fb18c1e06e43d82251c5956` | 315511357 | Alice |
| Settle run | `0xf173ecfc0232412a0e25ccc4d455819c10a50a3f424d3002c85af78a10bb845f` | 315512050 | Alice |

Every transaction above has status `success`. NetFold actions target the deployed clearing contract; the exact approval targets canonical Paxos test USDG and names NetFold as spender.

Verified settlement balances, in canonical USDG base units:

| Account | Before settlement | After settlement | Delta |
| --- | ---: | ---: | ---: |
| Alice | 134000000 | 134000000 | 0 |
| Bob | 40000000 | 44000000 | +4000000 |
| Carol | 20000000 | 22000000 | +2000000 |
| NetFold | 6000000 | 0 | -6000000 |
