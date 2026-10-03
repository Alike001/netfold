import { describe, expect, it } from "vitest";
import { lifecycleStatus, netfoldData, parseEvidence } from "@/lib/netfold-data";

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
