import type { Metadata } from "next";
import { CreateRunForm } from "@/components/create-run-form";

export const metadata: Metadata = { title: "Create a clearing run" };

export default function CreateRunPage() {
  return <main className="min-h-screen bg-[#f2f3f1]"><CreateRunForm /></main>;
}
