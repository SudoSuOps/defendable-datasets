import { RegistryWorkspace } from "@/components/RegistryWorkspace";
import { categories, datasets, domains, formats, licenses, tasks } from "@/lib/registry/data";

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
