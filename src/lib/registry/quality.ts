import type { Dataset } from "@/lib/schema/dataset";

const licenseScore: Record<string, number> = {
  "cc0-1.0": 20,
  "apache-2.0": 18,
  mit: 18,
  "cc-by-4.0": 14,
  "demo-research-only": 2,
};

export type RegistrySourceLabel = "demo" | "nas-indexed" | "verified-public" | "members-indexed";

export function getRegistrySourceLabel(dataset: Dataset): RegistrySourceLabel {
  if (dataset.status === "verified" && dataset.access === "public" && !dataset.source_type.includes("demo")) {
    return "verified-public";
  }
  if (dataset.external_locations?.length) return dataset.access === "members" ? "members-indexed" : "nas-indexed";
  return "demo";
}

export function getRegistrySourceText(dataset: Dataset) {
  const label = getRegistrySourceLabel(dataset);
  if (label === "verified-public") return "Verified public";
  if (label === "members-indexed") return "Members indexed";
  if (label === "nas-indexed") return "NAS indexed";
  return "Demo metadata";
}

export function getFineTuneReadiness(dataset: Dataset) {
  let score = 0;
  if (dataset.record_count > 0) score += 16;
  if (dataset.size_bytes > 0) score += 8;
  if (dataset.files.length > 0) score += 10;
  if (dataset.hashes.length >= dataset.files.length && dataset.files.length > 0) score += 12;
  if (dataset.receipts.length > 0) score += 8;
  if (dataset.validation.status === "passed") score += 14;
  if (dataset.status === "verified") score += 12;
  if (dataset.example_records.length > 0) score += 6;
  if (dataset.compatible_models.length > 0) score += 4;
  score += licenseScore[dataset.license] ?? 0;
  if (dataset.external_locations?.some((location) => location.sha256)) score += 8;
  return Math.min(100, score);
}

export function getReadinessLabel(score: number) {
  if (score >= 85) return "Fine-tune ready";
  if (score >= 65) return "Review ready";
  if (score >= 45) return "Indexed";
  return "Needs proof";
}

export type LicenseCompatibility = "compatible" | "review" | "restricted";

export function getLicenseCompatibility(licenses: string[]): LicenseCompatibility {
  if (licenses.includes("demo-research-only")) return "restricted";
  if (licenses.includes("cc-by-4.0")) return "review";
  return "compatible";
}
