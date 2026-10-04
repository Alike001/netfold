import evidence from "@/contracts/evidence/421614-run-002.json";
import { formatCompression, formatUsdg } from "@/lib/utils";

function assertRun002Evidence() {
  if (evidence.evidencePurpose !== "production-browser-acceptance") throw new Error("Run #002 evidence purpose mismatch");
  if (evidence.chainId !== 421_614 || evidence.runId !== 2) throw new Error("Run #002 identity mismatch");
  if (evidence.accounting.grossAmount !== 20_000_000) throw new Error("Run #002 gross mismatch");
  if (evidence.accounting.totalNetDebit !== 6_000_000 || evidence.accounting.totalNetCredit !== 6_000_000) throw new Error("Run #002 net accounting mismatch");
  if (evidence.accounting.totalFunded !== evidence.accounting.totalNetDebit) throw new Error("Run #002 coverage mismatch");
  if (evidence.accounting.compressionBps !== 7_000) throw new Error("Run #002 compression mismatch");
  if (evidence.finalState !== "SETTLED" || evidence.accounting.accountedRunLiability !== 0) throw new Error("Run #002 is not a completed settlement");
  if (evidence.transactions.runSettlement.hash !== "0xf173ecfc0232412a0e25ccc4d455819c10a50a3f424d3002c85af78a10bb845f") throw new Error("Run #002 settlement mismatch");
  if (evidence.transactions.usdgApproval.approvalEvent.amount !== 6_000_000) throw new Error("Run #002 approval mismatch");
  if (evidence.balances.deltas.bobAuditor !== 4_000_000 || evidence.balances.deltas.carolInfrastructure !== 2_000_000 || evidence.balances.deltas.netFold !== -6_000_000) throw new Error("Run #002 balance deltas mismatch");
}

assertRun002Evidence();

export const run002Data = {
  ...evidence,
  display: {
    gross: formatUsdg(evidence.accounting.grossAmount),
    liquidity: formatUsdg(evidence.accounting.totalNetDebit),
    compression: formatCompression(evidence.accounting.compressionBps),
  },
  links: {
    settlement: `${evidence.explorer}/tx/${evidence.transactions.runSettlement.hash}`,
    run: "/runs/2",
  },
} as const;

export function parseRun002Evidence() {
  return run002Data;
}
