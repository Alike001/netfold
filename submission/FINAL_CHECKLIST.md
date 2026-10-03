# NetFold — Final Submission Checklist

## Public surfaces

- [x] GitHub repository is public: https://github.com/Alike001/netfold
- [x] Live application is public: https://netfold-delta.vercel.app
- [x] Direct routes `/`, `/app`, `/proof`, and `/break` load publicly
- [x] GitHub navigation links resolve to the canonical repository

## Onchain evidence

- [x] NetFold is deployed on Arbitrum Sepolia
- [x] Settlement token is canonical Paxos test USDG
- [x] Contract and transaction explorer links checked
- [x] Proof page reconciles 200 USDG gross to 60 USDG net liquidity and 70% compression
- [x] Final run state is `SETTLED`
- [x] Accounted run liability is zero
- [x] Sourcify exact-match verification is documented

## Quality and security hygiene

- [x] Frontend lint, tests, and production build pass
- [x] Foundry formatting, build, and tests pass
- [x] No private keys or secret-bearing `.env` files are committed
- [x] Deployment and evidence artifacts are intentionally public
- [x] `MockUSDG` is clearly labeled test-only
- [x] No localhost links or judge-facing TODOs remain
- [x] Test counts are not presented as a security audit

## Submission package

- [x] Project description prepared
- [x] 2–3 minute demo script prepared
- [x] Judge Q&A prepared
- [ ] Demo video recorded and reviewed
- [ ] Final buildathon submission form completed
