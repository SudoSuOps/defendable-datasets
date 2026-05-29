import { RegistryWorkspace } from "@/components/RegistryWorkspace";
import { categories, datasets, domains, formats, licenses, tasks } from "@/lib/registry/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registry",
  description: "Search and filter the DefendableDatasets registry by domain, license, format, task, quality, source, and fine-tune readiness.",
};

export default function RegistryPage() {
  return (
    <RegistryWorkspace
      datasets={datasets}
      domains={domains}
      categories={categories}
      formats={formats}
      licenses={licenses}
      tasks={tasks}
    />
  );
}
