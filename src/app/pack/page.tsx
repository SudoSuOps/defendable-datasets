import { PackWorkspace } from "@/components/PackWorkspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pack Builder",
  description: "Compose datasets into fine-tuning packs and export manifests, dataset cards, README snippets, and SHA256 receipts.",
};

export default function PackPage() {
  return <PackWorkspace />;
}
