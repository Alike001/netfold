import { describe, expect, it } from "vitest";
import { encodeErrorResult, keccak256, toHex } from "viem";
import { netFoldAbi } from "@/lib/netfold-contract";
import {
  canAcceptObligation,
  deriveRunActions,
  formatTransactionError,
  hashReference,
  invitationPath,
  ObligationStatus,
  parseUsdgAmount,
  RunState,
  runStateLabel,
  validateDeadline,
  validateParticipants,
} from "@/lib/netfold-live";

const alice = "0x1111111111111111111111111111111111111111";
const bob = "0x2222222222222222222222222222222222222222";
const carol = "0x3333333333333333333333333333333333333333";

describe("live input validation", () => {
  it("accepts 2–8 unique addresses and normalizes them", () => {
    expect(validateParticipants([alice, bob]).valid).toBe(true);
    expect(validateParticipants(Array(8).fill(0).map((_, index) => `0x${(index + 1).toString(16).padStart(40, "0")}`)).valid).toBe(true);
  });

  it("rejects counts, duplicates, and malformed participants", () => {
    expect(validateParticipants([alice]).valid).toBe(false);
    expect(validateParticipants([alice, alice]).valid).toBe(false);
    expect(validateParticipants([alice, "not-address"]).valid).toBe(false);
    expect(validateParticipants([alice, "0x0000000000000000000000000000000000000000"]).valid).toBe(false);
  });

  it("requires a future deadline", () => {
    expect(validateDeadline(1_001, 1_000)).toEqual({ valid: true, deadline: 1001n });
    expect(validateDeadline(1_000, 1_000).valid).toBe(false);
  });

  it("parses USDG with exactly six supported decimal places", () => {
    expect(parseUsdgAmount("100")).toBe(100_000_000n);
    expect(parseUsdgAmount("0.000001")).toBe(1n);
    expect(() => parseUsdgAmount("1.0000001")).toThrow(/6 decimals/);
    expect(() => parseUsdgAmount("0")).toThrow(/greater than zero/);
  });

  it("hashes the trimmed human reference deterministically", () => {
    expect(hashReference(" INV-2026-001 ")).toBe(keccak256(toHex("INV-2026-001")));
    expect(() => hashReference("  ")).toThrow(/required/);
  });

  it("builds a focused invitation path", () => {
    expect(invitationPath(5n, 12n)).toBe("/runs/5?obligation=12");
  });

  it("maps every contract run state without inventing states", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map(runStateLabel)).toEqual([
      "NONE", "OPEN", "CLOSED", "COVERED", "SETTLED", "EXPIRED", "REFUNDED", "CANCELLED",
    ]);
    expect(runStateLabel(99)).toBe("UNKNOWN");
  });
});

describe("role and funding action derivation", () => {
  const base = {
    wallet: alice,
    correctChain: true,
    now: 1_000,
    run: { creator: alice, state: RunState.Open, fundingDeadline: 2_000n },
    obligations: [{ payer: bob, status: ObligationStatus.Accepted }],
  } as const;

  it("shows creator actions only for the creator on an open run", () => {
    expect(deriveRunActions(base)).toMatchObject({ canPropose: true, canClose: true, canCancelRun: true });
    expect(deriveRunActions({ ...base, wallet: carol })).toMatchObject({ canPropose: false, canClose: false, canCancelRun: false });
  });

  it("withholds close until all active obligations are accepted", () => {
    expect(deriveRunActions({ ...base, obligations: [{ payer: bob, status: ObligationStatus.Pending }] }).canClose).toBe(false);
  });

  it("allows only the named payer to accept a pending, unexpired obligation", () => {
    const request = { wallet: bob, correctChain: true, runState: RunState.Open, fundingDeadline: 2_000n, now: 1_000, payer: bob, status: ObligationStatus.Pending } as const;
    expect(canAcceptObligation(request)).toBe(true);
    expect(canAcceptObligation({ ...request, wallet: carol })).toBe(false);
    expect(canAcceptObligation({ ...request, now: 2_000 })).toBe(false);
    expect(canAcceptObligation({ ...request, status: ObligationStatus.Accepted })).toBe(false);
  });

  it("requires exact funding allowance before enabling fund", () => {
    const closed = { ...base, run: { ...base.run, state: RunState.Closed }, requiredFunding: 60_000_000n };
    expect(deriveRunActions({ ...closed, allowance: 0n })).toMatchObject({ canApprove: true, canFund: false });
    expect(deriveRunActions({ ...closed, allowance: 60_000_000n })).toMatchObject({ canApprove: false, canFund: true });
    expect(deriveRunActions({ ...closed, allowance: 59_999_999n })).toMatchObject({ canApprove: true, canFund: false });
  });

  it("disables funding after deadline and exposes expiry", () => {
    const result = deriveRunActions({ ...base, now: 2_000, run: { ...base.run, state: RunState.Closed }, requiredFunding: 1n, allowance: 1n });
    expect(result).toMatchObject({ canApprove: false, canFund: false, canExpire: true });
  });

  it("allows any connected wallet to settle covered runs", () => {
    expect(deriveRunActions({ ...base, wallet: carol, run: { ...base.run, state: RunState.Covered } }).canSettle).toBe(true);
    expect(deriveRunActions({ ...base, wallet: undefined, run: { ...base.run, state: RunState.Covered } }).canSettle).toBe(false);
  });

  it("shows no write action after settlement", () => {
    const result = deriveRunActions({ ...base, wallet: carol, run: { ...base.run, state: RunState.Settled } });
    expect(Object.entries(result).filter(([key]) => key.startsWith("can")).every(([, value]) => value === false)).toBe(true);
  });

  it("derives only the real full refund remainder", () => {
    const result = deriveRunActions({ ...base, run: { ...base.run, state: RunState.Expired }, funded: 60n, refunded: 0n });
    expect(result).toMatchObject({ canRefund: true, refundable: 60n });
    expect(deriveRunActions({ ...base, run: { ...base.run, state: RunState.Expired }, funded: 60n, refunded: 60n }).canRefund).toBe(false);
  });

  it("blocks every write on the wrong chain", () => {
    const result = deriveRunActions({ ...base, correctChain: false });
    expect(Object.entries(result).filter(([key]) => key.startsWith("can")).every(([, value]) => value === false)).toBe(true);
  });
});

describe("transaction errors", () => {
  const gasMessage = "max fee per gas less than block base fee: maxFeePerGas 100, baseFee 120";

  it("classifies stale EIP-1559 gas estimates before generic contract errors", () => {
    expect(formatTransactionError(new Error(gasMessage))).toBe(
      "Network gas price changed before broadcast. Retry with your wallet's latest gas estimate or a higher max fee.",
    );
  });

  it("finds maxFeePerGas and baseFee errors nested in wallet causes", () => {
    expect(formatTransactionError({
      message: "The contract function reverted",
      cause: { details: "maxFeePerGas is lower than baseFee for the current block" },
    })).toMatch(/^Network gas price changed before broadcast/);
  });

  it("formats known NetFold custom errors", () => {
    const data = encodeErrorResult({ abi: netFoldAbi, errorName: "NotRunCreator", args: [1n, bob] });
    expect(formatTransactionError({ data })).toBe("Only the run creator can perform this action.");
  });

  it("falls back safely for ordinary errors", () => {
    expect(formatTransactionError(new Error("Wallet request rejected"))).toBe("Wallet request rejected");
  });
});
