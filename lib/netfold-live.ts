import {
  BaseError,
  decodeErrorResult,
  getAddress,
  isAddress,
  keccak256,
  parseUnits,
  toHex,
  type Address,
} from "viem";
import { netFoldAbi, USDG_DECIMALS } from "@/lib/netfold-contract";

export enum RunState {
  None,
  Open,
  Closed,
  Covered,
  Settled,
  Expired,
  Refunded,
  Cancelled,
}

export enum ObligationStatus {
  None,
  Pending,
  Accepted,
  Cancelled,
}

export const RUN_STATE_LABELS = [
  "NONE",
  "OPEN",
  "CLOSED",
  "COVERED",
  "SETTLED",
  "EXPIRED",
  "REFUNDED",
  "CANCELLED",
] as const;

export type LiveRun = {
  creator: Address;
  state: number;
  fundingDeadline: bigint;
  createdAt: bigint;
  closedAt: bigint;
  settledAt: bigint;
  expiredAt: bigint;
  grossAmount: bigint;
  totalNetDebit: bigint;
  totalFunded: bigint;
  totalRefunded: bigint;
  participants: readonly Address[];
  obligationIds: readonly bigint[];
};

export type LiveObligation = {
  id: bigint;
  runId: bigint;
  payer: Address;
  payee: Address;
  amount: bigint;
  referenceHash: `0x${string}`;
  status: number;
  createdAt: bigint;
  acceptedAt: bigint;
};

export type LivePosition = {
  participant: Address;
  grossPayable: bigint;
  grossReceivable: bigint;
  netDebit: bigint;
  netCredit: bigint;
  funded: bigint;
  refunded: bigint;
};

export function validateParticipants(values: string[]) {
  if (values.length < 2 || values.length > 8) {
    return { valid: false as const, error: "Add between 2 and 8 participants." };
  }
  if (values.some((value) => !isAddress(value, { strict: false }))) {
    return { valid: false as const, error: "Every participant must be a valid EVM address." };
  }
  const participants = values.map((value) => getAddress(value));
  if (participants.some((value) => value === "0x0000000000000000000000000000000000000000")) {
    return { valid: false as const, error: "The zero address cannot be a participant." };
  }
  if (new Set(participants.map((value) => value.toLowerCase())).size !== participants.length) {
    return { valid: false as const, error: "Participant addresses must be unique." };
  }
  return { valid: true as const, participants };
}

export function validateDeadline(timestampSeconds: number, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!Number.isSafeInteger(timestampSeconds) || timestampSeconds <= nowSeconds) {
    return { valid: false as const, error: "Funding deadline must be in the future." };
  }
  return { valid: true as const, deadline: BigInt(timestampSeconds) };
}

export function parseUsdgAmount(value: string) {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) throw new Error("Enter a positive USDG amount with up to 6 decimals.");
  const amount = parseUnits(trimmed, USDG_DECIMALS);
  if (amount <= 0n) throw new Error("USDG amount must be greater than zero.");
  if (amount > (1n << 128n) - 1n) throw new Error("USDG amount exceeds the contract limit.");
  return amount;
}

export function hashReference(value: string) {
  const reference = value.trim();
  if (!reference) throw new Error("Reference is required.");
  return keccak256(toHex(reference));
}

export function invitationPath(runId: bigint | number | string, obligationId: bigint | number | string) {
  return `/runs/${runId.toString()}?obligation=${obligationId.toString()}`;
}

export function runStateLabel(state: number) {
  return RUN_STATE_LABELS[state] ?? "UNKNOWN";
}

export function obligationStatusLabel(status: number) {
  return ["NONE", "PENDING", "ACCEPTED", "CANCELLED"][status] ?? "UNKNOWN";
}

export type ActionContext = {
  wallet?: Address;
  correctChain: boolean;
  now: number;
  run: Pick<LiveRun, "creator" | "state" | "fundingDeadline">;
  obligations: ReadonlyArray<Pick<LiveObligation, "payer" | "status">>;
  requiredFunding?: bigint;
  allowance?: bigint;
  funded?: bigint;
  refunded?: bigint;
};

export function deriveRunActions(context: ActionContext) {
  const wallet = context.wallet?.toLowerCase();
  const isCreator = wallet === context.run.creator.toLowerCase();
  const canWrite = Boolean(wallet && context.correctChain);
  const isOpen = context.run.state === RunState.Open;
  const isClosed = context.run.state === RunState.Closed;
  const beforeDeadline = BigInt(context.now) < context.run.fundingDeadline;
  const requirement = context.requiredFunding ?? 0n;
  const allowance = context.allowance ?? 0n;
  const refundable = (context.funded ?? 0n) - (context.refunded ?? 0n);
  const allAccepted = context.obligations.length > 0 && context.obligations
    .filter((item) => item.status !== ObligationStatus.Cancelled)
    .every((item) => item.status === ObligationStatus.Accepted);

  return {
    isCreator,
    canPropose: canWrite && isCreator && isOpen && beforeDeadline,
    canMutateObligations: canWrite && isCreator && isOpen && beforeDeadline,
    canCancelRun: canWrite && isCreator && isOpen,
    canClose: canWrite && isCreator && isOpen && beforeDeadline && allAccepted,
    canApprove: canWrite && isClosed && beforeDeadline && requirement > 0n && allowance < requirement,
    canFund: canWrite && isClosed && beforeDeadline && requirement > 0n && allowance >= requirement,
    canSettle: canWrite && context.run.state === RunState.Covered,
    canExpire: canWrite && isClosed && BigInt(context.now) >= context.run.fundingDeadline,
    canRefund: canWrite && context.run.state === RunState.Expired && refundable > 0n,
    refundable: refundable > 0n ? refundable : 0n,
  };
}

export function canAcceptObligation({
  wallet,
  correctChain,
  runState,
  fundingDeadline,
  now,
  payer,
  status,
}: {
  wallet?: Address;
  correctChain: boolean;
  runState: number;
  fundingDeadline: bigint;
  now: number;
  payer: Address;
  status: number;
}) {
  return Boolean(
    wallet &&
    correctChain &&
    wallet.toLowerCase() === payer.toLowerCase() &&
    runState === RunState.Open &&
    status === ObligationStatus.Pending &&
    BigInt(now) < fundingDeadline,
  );
}

const FRIENDLY_ERRORS: Record<string, string> = {
  AlreadyFunded: "This debtor has already funded the run.",
  DuplicateParticipant: "Each participant may appear only once.",
  DuplicateReferenceHash: "That reference has already been used in this run.",
  FundingDeadlineNotReached: "The funding deadline has not passed yet.",
  FundingDeadlineReached: "The funding deadline has passed.",
  InvalidDeadline: "Choose a future funding deadline.",
  InvalidObligationParties: "Payer and payee must be different participants.",
  InvalidObligationStatus: "This obligation is no longer in the required state.",
  InvalidParticipant: "One or more participants are invalid.",
  InvalidParticipantCount: "A run must contain 2–8 participants.",
  InvalidReferenceHash: "The obligation reference cannot be empty.",
  InvalidRunState: "This action is not available in the run’s current state.",
  NoFundingRequired: "This wallet has no remaining net debit to fund.",
  NoObligations: "Add at least one accepted obligation before closing.",
  NoRefundAvailable: "This wallet has no refund available.",
  NotObligationPayer: "Only the named payer can accept this obligation.",
  NotParticipant: "This wallet is not a participant in the run.",
  NotRunCreator: "Only the run creator can perform this action.",
  RunNotFullyFunded: "The run cannot settle until every net debit is funded.",
  UnacceptedObligation: "Every active obligation must be accepted before closing.",
  ZeroAmount: "The amount must be greater than zero.",
};

function findRevertData(error: unknown): `0x${string}` | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as Record<string, unknown>;
  if (typeof candidate.data === "string" && candidate.data.startsWith("0x")) return candidate.data as `0x${string}`;
  if (candidate.cause && candidate.cause !== error) return findRevertData(candidate.cause);
  return undefined;
}

function collectErrorText(error: unknown, seen = new Set<unknown>()): string {
  if (!error || typeof error !== "object" || seen.has(error)) return "";
  seen.add(error);
  const candidate = error as Record<string, unknown>;
  const fields = [candidate.name, candidate.message, candidate.shortMessage, candidate.details];
  if (Array.isArray(candidate.metaMessages)) fields.push(candidate.metaMessages.join(" "));
  if (candidate.cause && candidate.cause !== error) fields.push(collectErrorText(candidate.cause, seen));
  return fields.filter((value): value is string => typeof value === "string").join(" ");
}

function isStaleGasEstimateError(error: unknown) {
  const normalized = collectErrorText(error).toLowerCase().replace(/[\s_-]+/g, "");
  return normalized.includes("maxfeepergas") &&
    normalized.includes("basefee") &&
    (normalized.includes("lessthan") || normalized.includes("lowerthan") || normalized.includes("below"));
}

export function formatTransactionError(error: unknown) {
  if (isStaleGasEstimateError(error)) {
    return "Network gas price changed before broadcast. Retry with your wallet's latest gas estimate or a higher max fee.";
  }
  const data = findRevertData(error);
  if (data) {
    try {
      const decoded = decodeErrorResult({ abi: netFoldAbi, data });
      return FRIENDLY_ERRORS[decoded.errorName] ?? `Contract reverted: ${decoded.errorName}.`;
    } catch {
      // Fall through to viem's concise error.
    }
  }
  if (error instanceof BaseError) return error.shortMessage;
  if (error instanceof Error) return error.message;
  return "The transaction could not be completed.";
}
