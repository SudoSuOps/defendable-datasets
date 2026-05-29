import categoriesJson from "../../../data/registry/categories.json";
import datasetsJson from "../../../data/registry/datasets.json";
import domainsJson from "../../../data/registry/domains.json";
import formatsJson from "../../../data/registry/formats.json";
import licensesJson from "../../../data/registry/licenses.json";
import receiptsJson from "../../../data/registry/receipts.json";
import tasksJson from "../../../data/registry/tasks.json";
import type {
  Category,
  Dataset,
  DatasetReceipt,
  Domain,
  FormatDefinition,
  LicenseDefinition,
  TaskDefinition,
} from "@/lib/schema/dataset";

export const datasets = datasetsJson as Dataset[];
export const domains = domainsJson as Domain[];
export const categories = categoriesJson as Category[];
export const licenses = licensesJson as LicenseDefinition[];
export const formats = formatsJson as FormatDefinition[];
export const tasks = tasksJson as TaskDefinition[];
export const receipts = receiptsJson as DatasetReceipt[];

export function getDatasetById(id: string) {
  return datasets.find((dataset) => dataset.id === id);
}

export function getDatasetBySlug(slug: string) {
  return datasets.find((dataset) => dataset.slug === slug || dataset.id === slug);
}

export function labelFor(collection: { id: string; name: string }[], id: string) {
  return collection.find((item) => item.id === id)?.name ?? id;
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
