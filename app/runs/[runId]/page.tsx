import type { Metadata } from "next";
import { LiveRunWorkspace } from "@/components/live-run-workspace";

export const metadata: Metadata = { title: "Live clearing run" };

export default async function RunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId: value } = await params;
  if (!/^\d+$/.test(value) || value === "0") {
    return <main className="min-h-screen bg-[#f2f3f1] px-5 py-20 text-center"><h1 className="text-3xl font-semibold">Invalid run ID</h1><p className="mt-3 text-[#68717a]">Use a positive numeric onchain run identifier.</p></main>;
  }
  return <main className="min-h-screen bg-[#f2f3f1]"><LiveRunWorkspace runId={BigInt(value)} /></main>;
}
