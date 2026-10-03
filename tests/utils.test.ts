import { describe, expect, it } from "vitest";
import { formatCompression, formatUsdg, truncateAddress, truncateHash } from "@/lib/utils";

describe("USDG formatting", () => {
  it("formats six-decimal base units as human USDG", () => {
    expect(formatUsdg(200_000_000)).toBe("200");
    expect(formatUsdg(60_000_000)).toBe("60");
    expect(formatUsdg(1_234_567)).toBe("1.234567");
  });

  it("retains six decimals in technical mode", () => {
    expect(formatUsdg(40_000_000, { technical: true })).toBe("40.000000");
  });

  it("rejects invalid base-unit values", () => {
    expect(() => formatUsdg(-1)).toThrow();
    expect(() => formatUsdg(1.5)).toThrow();
  });
});

describe("compression formatting", () => {
  it("converts basis points to percent", () => {
    expect(formatCompression(7_000)).toBe("70%");
    expect(formatCompression(6_625)).toBe("66.25%");
  });
});

describe("identifier truncation", () => {
  it("truncates an address without changing its ends", () => {
    expect(truncateAddress("0x516479a53483b675Fe4629E3C63088c51cf6eFa7")).toBe("0x5164…eFa7");
  });

  it("uses a wider transaction-hash preview", () => {
    expect(truncateHash("0xaad186dc5b295f7b681e1c106e9d54d6c369a548c118b26719d515b0792e2af3")).toBe(
      "0xaad186dc…792e2af3",
    );
  });
});
