import type { PackManifest } from "@/lib/schema/pack";

export type PackExportKind =
  | "pack.manifest.json"
  | "hf_dataset_card.md"
  | "fine_tune_manifest.json"
  | "sha256_manifest.json"
  | "README.md";

function json(data: unknown) {
  return JSON.stringify(data, null, 2);
}

export function renderDatasetCard(manifest: PackManifest) {
  return `---
license: ${manifest.licenses.join(", ")}
task_categories: ${manifest.tasks.join(", ")}
pretty_name: ${manifest.name}
---

# ${manifest.name}

${manifest.description}

## Datasets

${manifest.datasets.map((dataset) => `- ${dataset.title} (${dataset.id}) - ${dataset.record_count.toLocaleString()} records`).join("\n")}

## Provenance

This card was generated from DefendableDatasets registry metadata. Verify SHA256 hashes before training.

## Warnings

${manifest.warnings.length ? manifest.warnings.map((warning) => `- ${warning}`).join("\n") : "- No warnings generated."}
`;
}

export function renderReadmeSnippet(manifest: PackManifest) {
  return `## ${manifest.name}

This pack contains ${manifest.datasets.length} datasets, ${manifest.total_record_count.toLocaleString()} records, and ${manifest.hashes.length} file hashes.

Licenses: ${manifest.licenses.join(", ")}
Formats: ${manifest.formats.join(", ")}
Tasks: ${manifest.tasks.join(", ")}

Doctrine: No proof, no honey. Verify hashes and receipts before shipping.
`;
}

export function renderPackExport(manifest: PackManifest, kind: PackExportKind) {
  if (kind === "hf_dataset_card.md") return renderDatasetCard(manifest);
  if (kind === "README.md") return renderReadmeSnippet(manifest);
  if (kind === "fine_tune_manifest.json") {
    return json({
      name: manifest.name,
      created_at: manifest.created_at,
      datasets: manifest.datasets.map((dataset) => ({
        id: dataset.id,
        title: dataset.title,
        formats: dataset.formats,
        tasks: dataset.tasks,
        files: dataset.files,
        intended_use: dataset.intended_use,
        notes: dataset.compatible_models,
      })),
      warnings: manifest.warnings,
      fine_tune_notes: manifest.fine_tune_notes,
    });
  }
  if (kind === "sha256_manifest.json") {
    return json({
      created_at: manifest.created_at,
      files: manifest.files.map((file) => ({
        path: file.path,
        sha256: file.sha256,
        size_bytes: file.size_bytes,
        record_count: file.record_count,
      })),
    });
  }
  return json(manifest);
}

export function downloadText(filename: string, content: string, mime = "application/octet-stream") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
