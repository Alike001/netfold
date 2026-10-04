# NetFold — Judge Q&A

## Why blockchain?

It gives every participant and reviewer one shared, timestamped record of acceptance, coverage, failure conditions, and final settlement. The contract also enforces that no credit is released before the complete run is covered.

## Why Arbitrum?

Clearing needs frequent, low-cost state transitions and standard EVM tooling. Arbitrum makes the complete lifecycle inexpensive to execute and straightforward to verify with wallets, Foundry, viem, and Arbiscan.

## Why USDG?

Business obligations are naturally dollar-denominated. Canonical Paxos test USDG provides a recognizable six-decimal settlement asset without NetFold issuing or promoting another token.

## Isn't netting already used by banks?

Yes. NetFold applies the liquidity principle to stablecoin-native operations. It does not claim to invent netting or to create legally enforceable bank netting arrangements.

## What makes NetFold different from a normal accounting system?

An accounting system can calculate balances. NetFold additionally records explicit debtor acceptance, enforces an immutable close, requires complete onchain coverage, and atomically settles the final positions from public state.

## Can I actually use NetFold myself?

Yes. On Arbitrum Sepolia, a connected wallet can create a clearing run, propose obligations, invite counterparties, collect debtor acceptance, close the run, fund an exact finalized debit in canonical Paxos test USDG, settle a fully covered run, and use the expiry/refund path when applicable.

Judges who do not want to obtain testnet ETH or USDG can use Run #001 as the canonical pre-recorded evidence path. Its contract, obligations, settlement transaction, balance reconciliation, failure simulations, and zero accounted liability are publicly inspectable without connecting a wallet.

Run #002 separately proves the production frontend path: three wallets completed creation, proposal, acceptance, close, exact approval, funding, and settlement through the deployed public application.

## What happens if a debtor doesn't fund?

The run cannot settle. NetFold provides no credit and does not mutualize the missing amount. After expiry, a debtor that did fund can reclaim its own contribution.

## Who can create obligations?

In V1, the run creator proposes the bounded set of obligations. A proposal does not bind its debtor until that debtor accepts it.

## Why is debtor acceptance important?

It prevents the creator or another participant from unilaterally assigning a payable to someone else. Closing is allowed only after every named debtor has accepted.

## Does NetFold provide credit?

No. Settlement is fully covered. Nothing is released until all finalized net debits are funded.

## Is this legally enforceable netting?

NetFold makes no legal-netting claim. The prototype demonstrates technical obligation approval, liquidity compression, coverage, and settlement. Legal enforceability would require jurisdiction-specific agreements and counsel.

## What is live vs simulated?

The deployment and both completed runs are live Arbitrum Sepolia transactions. Run #001 is the canonical 100/60/40 protocol proof; Run #002 is the 10/6/4 production-frontend acceptance proof. The premature and double-settlement failures are live-state `eth_call` simulations and were not broadcast. The broader attack cases are local Foundry tests.

## Why does only 60 USDG need to be funded?

Studio owes 100 and receives 40, so its final debit is 60. Auditor receives 100 and owes 60, so it receives 40. Infrastructure receives 60 and owes 40, so it receives 20. The only net debit is 60, equal to the 40 plus 20 net credits.

## Are you claiming 70% fewer token transfers?

No. The claim is 70% gross-to-net compression: 200 USDG of gross obligations becomes 60 USDG of required settlement liquidity. Transfer-count reduction is not the metric.

## What would you build at Founder House?

Next I would add recurring clearing windows, business/team workspaces, and accounting and treasury integrations. The Founder House direction is Issuer Rails: branded business settlement tokens backed 1:1 by USDG, public reserve verification, holder redemption into USDG, and multi-issuer clearing through the common USDG layer. That issuer architecture is roadmap scope only and is not implemented in the current contract or product.
