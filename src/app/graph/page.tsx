import { GraphRouteClient } from "@/components/GraphRouteClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dataset Graph",
  description: "Explore DefendableDatasets as a living graph of domains, categories, datasets, versions, files, licenses, formats, tasks, and receipts.",
};

export default function GraphPage() {
  return <GraphRouteClient />;
}
