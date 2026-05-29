import type { Dataset } from "@/lib/schema/dataset";
import { getLicenseCompatibility } from "@/lib/registry/quality";

const restrictiveLicenses = new Set(["demo-research-only"]);

export function validatePack(datasets: Dataset[]) {
  const warnings: string[] = [];
  const licenses = new Set(datasets.map((dataset) => dataset.license));
  const formats = new Set(datasets.flatMap((dataset) => dataset.formats));
  const statuses = new Set(datasets.map((dataset) => dataset.status));
  const compatibility = getLicenseCompatibility([...licenses]);

  if (datasets.length === 0) warnings.push("Pack is empty.");
  if ([...licenses].some((license) => restrictiveLicenses.has(license))) {
    warnings.push("One or more datasets use a demo or restricted license. Review before commercial use.");
  }
  if (compatibility === "review") warnings.push("Attribution licenses are present. Keep license notices with exports.");
  if (compatibility === "restricted") warnings.push("License compatibility is restricted for production fine-tuning.");
  if (formats.size > 3) warnings.push("Pack spans many formats. Pick a primary export format before fine-tuning.");
  if (statuses.has("draft")) warnings.push("Draft datasets need source receipts before production training.");
  if (datasets.some((dataset) => dataset.validation.status !== "passed")) {
    warnings.push("At least one dataset has pending validation.");
  }

  return warnings;
}
