import { describe, expect, it } from "vitest";
import { lifecycleStatus, netfoldData, parseEvidence } from "@/lib/netfold-data";
import { parseRun002Evidence, run002Data } from "@/lib/run-002-data";

describe("committed live evidence", () => {
  it("parses the canonical Arbitrum Sepolia deployment", () => {
    const data = parseEvidence();
    expect(data.network.chainId).toBe(421_614);
    expect(data.deployment.contract).toBe("0x516479a53483b675Fe4629E3C63088c51cf6eFa7");
    expect(data.deployment.token).toBe("0xFFC95faa3d63Cde504a05B567C600B78C0b41892");
  });

  it("reconciles the approved fixture with live accounting", () => {
    expect(netfoldData.obligations.map((item) => item.amount)).toEqual([100_000_000, 60_000_000, 40_000_000]);
    expect(netfoldData.obligations.reduce((sum, item) => sum + item.amount, 0)).toBe(netfoldData.run.gross);
    expect(netfoldData.positions.map((item) => item.amount)).toEqual([60_000_000, 40_000_000, 20_000_000]);
    expect(netfoldData.run.totalDebit).toBe(netfoldData.run.totalCredit);
  });

  it("maps every completed lifecycle state", () => {
    expect(netfoldData.lifecycle.map((step) => step.label)).toEqual([
      "CREATED",
      "ACCEPTED",
      "CLOSED",
      "COVERED",
      "SETTLED",
    ]);
    expect(lifecycleStatus("SETTLED")).toBe("complete");
  });

  it("preserves settled balances and zero accounted liability", () => {
    expect(netfoldData.balances.map((row) => row.afterSettlement)).toEqual([
      140_000_000,
      40_000_000,
      20_000_000,
      0,
    ]);
    expect(netfoldData.run.accountedLiability).toBe(0);
    expect(netfoldData.run.state).toBe("SETTLED");
  });

  it("generates Arbiscan links from the artifact explorer", () => {
    expect(netfoldData.links.tx(netfoldData.run.settlementHash)).toBe(
      "https://sepolia.arbiscan.io/tx/0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3",
    );
  });
});

describe("production-browser acceptance evidence", () => {
  it("reconciles Run #002 as a distinct 20/6/70 proof", () => {
    const data = parseRun002Evidence();
    expect(data.evidencePurpose).toBe("production-browser-acceptance");
    expect(data.obligations.map((item) => item.obligationId)).toEqual([4, 5, 6]);
    expect(data.display).toEqual({ gross: "20", liquidity: "6", compression: "70%" });
    expect(data.finalState).toBe("SETTLED");
    expect(data.accounting.accountedRunLiability).toBe(0);
  });

  it("preserves receipt-backed approval, funding, settlement, and deltas", () => {
    expect(run002Data.transactions.usdgApproval.approvalEvent.amount).toBe(6_000_000);
    expect(run002Data.transactions.runFunding.runFundedEvent).toMatchObject({ runId: 2, amount: 6_000_000 });
    expect(run002Data.transactions.runSettlement.settlementPaidEvents.map((event) => event.amount)).toEqual([4_000_000, 2_000_000]);
    expect(run002Data.balances.deltas).toMatchObject({ aliceStudio: 0, bobAuditor: 4_000_000, carolInfrastructure: 2_000_000, netFold: -6_000_000 });
  });
});
