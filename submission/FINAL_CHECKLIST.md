# NetFold — Final Submission Checklist

## Public surfaces

- [x] GitHub repository is public: https://github.com/Alike001/netfold
- [x] Live application is public: https://netfold-delta.vercel.app
- [x] Direct route `/` loads publicly
- [x] Direct route `/app` loads publicly
- [x] Direct route `/create` loads publicly
- [x] Direct route `/runs/1` loads publicly
- [x] Direct route `/runs/2` loads publicly
- [x] Direct route `/proof` loads publicly
- [x] Direct route `/break` loads publicly
- [x] GitHub navigation links resolve to the canonical repository
- [x] Full public write workflow is implemented

## Onchain evidence

- [x] NetFold is deployed on Arbitrum Sepolia
- [x] Settlement token is canonical Paxos test USDG
- [x] Contract and transaction explorer links checked
- [x] Proof page reconciles 200 USDG gross to 60 USDG net liquidity and 70% compression
- [x] Final run state is `SETTLED`
- [x] Accounted run liability is zero
- [x] Sourcify exact-match verification is documented

## Production-browser acceptance

- [x] Production-browser Run #002 executed with real wallet transactions
- [x] Run #002 uses Alice → Bob 10, Bob → Carol 6, Carol → Alice 4 USDG
- [x] Run #002 proves 20 USDG gross, 6 USDG required liquidity, and 70% compression
- [x] Run #002 explorer receipts checked through read-only RPC reconstruction
- [x] Run #002 final state and balance movements checked
- [ ] New `/docs` route deployed and checked publicly after approval

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
- [x] Demo script reflects the Phase 5 public write workflow
- [x] Production write flow used real wallet transactions
- [x] Judge Q&A prepared
- [ ] Demo video recorded and reviewed
- [ ] Final buildathon submission form completed
