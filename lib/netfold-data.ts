import type { Address, Hash } from "viem";
import deploymentArtifact from "@/contracts/deployments/421614.json";
import evidenceArtifact from "@/contracts/evidence/421614-run-001.json";
import { formatCompression, formatUsdg } from "@/lib/utils";

type DeploymentArtifact = typeof deploymentArtifact;
type EvidenceArtifact = typeof evidenceArtifact;

const asAddress = (value: string) => value as Address;
const asHash = (value: string) => value as Hash;

function assertEvidence(deployment: DeploymentArtifact, evidence: EvidenceArtifact) {
  if (deployment.chainId !== evidence.chainId) throw new Error("Evidence chain mismatch");
  if (deployment.netFold.toLowerCase() !== evidence.netFold.toLowerCase()) {
    throw new Error("Evidence contract mismatch");
  }
  if (deployment.settlementToken.toLowerCase() !== evidence.canonicalUSDG.toLowerCase()) {
    throw new Error("Evidence settlement-token mismatch");
  }
  if (evidence.totalNetDebit !== evidence.totalNetCredit) {
    throw new Error("Evidence debit/credit mismatch");
  }
  if (evidence.totalFunded !== evidence.totalNetDebit) {
    throw new Error("Evidence coverage mismatch");
  }
  if (evidence.finalState !== "SETTLED" || evidence.accountedRunLiability !== 0) {
    throw new Error("Evidence is not a completed settlement");
  }
}

assertEvidence(deploymentArtifact, evidenceArtifact);

const explorer = deploymentArtifact.explorer;
const tx = (hash: string) => `${explorer}/tx/${hash}`;
const address = (value: string) => `${explorer}/address/${value}`;

export const participants = {
  studio: { name: "Studio", address: asAddress(evidenceArtifact.aliceStudio) },
  auditor: { name: "Auditor", address: asAddress(evidenceArtifact.bobAuditor) },
  infrastructure: {
    name: "Infrastructure",
    address: asAddress(evidenceArtifact.carolInfrastructure),
  },
} as const;

export const obligations = [
  {
    id: evidenceArtifact.obligationIds[0],
    payer: participants.studio,
    payee: participants.auditor,
    amount: 100_000_000,
    referenceHash: asHash(evidenceArtifact.referenceHashes[0]),
    proposalHash: asHash(evidenceArtifact.obligationProposalTransactionHashes[0]),
    acceptanceHash: asHash(evidenceArtifact.acceptanceTransactionHashes[0]),
  },
  {
    id: evidenceArtifact.obligationIds[1],
    payer: participants.auditor,
    payee: participants.infrastructure,
    amount: 60_000_000,
    referenceHash: asHash(evidenceArtifact.referenceHashes[1]),
    proposalHash: asHash(evidenceArtifact.obligationProposalTransactionHashes[1]),
    acceptanceHash: asHash(evidenceArtifact.acceptanceTransactionHashes[1]),
  },
  {
    id: evidenceArtifact.obligationIds[2],
    payer: participants.infrastructure,
    payee: participants.studio,
    amount: 40_000_000,
    referenceHash: asHash(evidenceArtifact.referenceHashes[2]),
    proposalHash: asHash(evidenceArtifact.obligationProposalTransactionHashes[2]),
    acceptanceHash: asHash(evidenceArtifact.acceptanceTransactionHashes[2]),
  },
] as const;

if (obligations.reduce((total, item) => total + item.amount, 0) !== evidenceArtifact.grossAmount) {
  throw new Error("Fixture obligations do not reconcile to live gross amount");
}

export const lifecycle = [
  { label: "CREATED", hash: asHash(evidenceArtifact.creationTransactionHash) },
  { label: "ACCEPTED", hashes: evidenceArtifact.acceptanceTransactionHashes.map(asHash) },
  { label: "CLOSED", hash: asHash(evidenceArtifact.closeTransactionHash) },
  { label: "COVERED", hash: asHash(evidenceArtifact.fundingTransactionHash) },
  { label: "SETTLED", hash: asHash(evidenceArtifact.settlementTransactionHash) },
] as const;

export const netfoldData = {
  network: {
    name: "Arbitrum Sepolia",
    chainId: deploymentArtifact.chainId,
    explorer,
  },
  deployment: {
    contract: asAddress(deploymentArtifact.netFold),
    token: asAddress(deploymentArtifact.settlementToken),
    transactionHash: asHash(deploymentArtifact.deploymentTransactionHash),
    block: deploymentArtifact.deploymentBlock,
    verificationStatus: deploymentArtifact.sourceVerificationStatus,
    verificationUrl: deploymentArtifact.sourceVerificationUrl,
  },
  run: {
    id: evidenceArtifact.runId,
    state: evidenceArtifact.finalState,
    gross: evidenceArtifact.grossAmount,
    totalDebit: evidenceArtifact.totalNetDebit,
    totalCredit: evidenceArtifact.totalNetCredit,
    totalFunded: evidenceArtifact.totalFunded,
    compressionBps: evidenceArtifact.compressionBps,
    settlementHash: asHash(evidenceArtifact.settlementTransactionHash),
    settlementBlock: evidenceArtifact.settlementBlock,
    accountedLiability: evidenceArtifact.accountedRunLiability,
  },
  participants,
  obligations,
  lifecycle,
  positions: [
    { participant: participants.studio, direction: "PAY", amount: evidenceArtifact.aliceNetDebit },
    { participant: participants.auditor, direction: "RECEIVE", amount: evidenceArtifact.bobNetCredit },
    {
      participant: participants.infrastructure,
      direction: "RECEIVE",
      amount: evidenceArtifact.carolNetCredit,
    },
  ],
  balances: [
    {
      name: "Studio",
      beforeFunding: evidenceArtifact.aliceBalanceBeforeFunding,
      beforeSettlement: evidenceArtifact.aliceBalanceBeforeSettlement,
      afterSettlement: evidenceArtifact.aliceBalanceAfterSettlement,
    },
    {
      name: "Auditor",
      beforeFunding: evidenceArtifact.bobBalanceBeforeFunding,
      beforeSettlement: evidenceArtifact.bobBalanceBeforeSettlement,
      afterSettlement: evidenceArtifact.bobBalanceAfterSettlement,
    },
    {
      name: "Infrastructure",
      beforeFunding: evidenceArtifact.carolBalanceBeforeFunding,
      beforeSettlement: evidenceArtifact.carolBalanceBeforeSettlement,
      afterSettlement: evidenceArtifact.carolBalanceAfterSettlement,
    },
    {
      name: "NetFold",
      beforeFunding: evidenceArtifact.netFoldBalanceBeforeFunding,
      beforeSettlement: evidenceArtifact.netFoldBalanceBeforeSettlement,
      afterSettlement: evidenceArtifact.netFoldBalanceAfterSettlement,
    },
  ],
  failures: [
    {
      title: "Premature settlement",
      evidence: evidenceArtifact.prematureSettlementEvidence,
      selector: evidenceArtifact.prematureSettlementErrorSelector,
      revertData: evidenceArtifact.prematureSettlementRevertData,
    },
    {
      title: "Double settlement",
      evidence: evidenceArtifact.secondSettlementEvidence,
      selector: evidenceArtifact.secondSettlementErrorSelector,
      revertData: evidenceArtifact.secondSettlementRevertData,
    },
  ],
  links: { tx, address },
  display: {
    gross: formatUsdg(evidenceArtifact.grossAmount),
    liquidity: formatUsdg(evidenceArtifact.totalNetDebit),
    compression: formatCompression(evidenceArtifact.compressionBps),
  },
} as const;

export type LifecycleLabel = (typeof lifecycle)[number]["label"];

export function lifecycleStatus(label: LifecycleLabel) {
  return lifecycle.some((step) => step.label === label) ? "complete" : "pending";
}

export function parseEvidence() {
  return netfoldData;
}
