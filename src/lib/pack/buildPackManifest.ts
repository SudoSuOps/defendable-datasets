import type { Dataset } from "@/lib/schema/dataset";
import type { PackManifest } from "@/lib/schema/pack";
import { validatePack } from "./validatePack";

export function buildPackManifest(
  selectedDatasets: Dataset[],
  options: { name?: string; description?: string } = {},
): PackManifest {
  const files = selectedDatasets.flatMap((dataset) => dataset.files);
  return {
    pack_id: `pack_${Date.now().toString(36)}`,
    name: options.name ?? "DefendableDatasets Custom Pack",
    description:
      options.description ??
      "Client-generated pack manifest from the local DefendableDatasets registry.",
    created_at: new Date().toISOString(),
    datasets: selectedDatasets,
    total_record_count: selectedDatasets.reduce((sum, dataset) => sum + dataset.record_count, 0),
    total_size_bytes: selectedDatasets.reduce((sum, dataset) => sum + dataset.size_bytes, 0),
    licenses: [...new Set(selectedDatasets.map((dataset) => dataset.license))],
    formats: [...new Set(selectedDatasets.flatMap((dataset) => dataset.formats))],
    tasks: [...new Set(selectedDatasets.flatMap((dataset) => dataset.tasks))],
    warnings: validatePack(selectedDatasets),
    files,
    hashes: [...new Set(files.map((file) => file.sha256))],
    recommended_use:
      "Use as a reviewable manifest for dataset selection, validation, and fine-tuning preparation.",
    fine_tune_notes: [
      "Normalize formats before training.",
      "Verify every SHA256 receipt against real files before production use.",
      "Keep dataset cards and license notices with exported artifacts.",
    ],
  };
}
