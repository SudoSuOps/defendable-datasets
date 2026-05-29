#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const requiredDatasetFields = [
  "id",
  "title",
  "slug",
  "description",
  "domain",
  "category",
  "version",
  "status",
  "access",
  "license",
  "formats",
  "tasks",
  "record_count",
  "size_bytes",
  "source_type",
  "provenance_summary",
  "intended_use",
  "not_intended_use",
  "quality_score",
  "validation",
  "files",
  "hashes",
  "receipts",
  "example_records",
  "citation",
];

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf8"));
}

function loadRegistry() {
  return {
    datasets: readJson("data/registry/datasets.json"),
    domains: readJson("data/registry/domains.json"),
    categories: readJson("data/registry/categories.json"),
    licenses: readJson("data/registry/licenses.json"),
    formats: readJson("data/registry/formats.json"),
    tasks: readJson("data/registry/tasks.json"),
    receipts: readJson("data/registry/receipts.json"),
  };
}

function validate() {
  const registry = loadRegistry();
  const errors = [];
  const warnings = [];
  const ids = new Set();
  const domains = new Set(registry.domains.map((item) => item.id));
  const categories = new Set(registry.categories.map((item) => item.id));
  const licenses = new Set(registry.licenses.map((item) => item.id));
  const formats = new Set(registry.formats.map((item) => item.id));
  const tasks = new Set(registry.tasks.map((item) => item.id));
  const receipts = new Set(registry.receipts.map((item) => item.id));

  for (const dataset of registry.datasets) {
    for (const field of requiredDatasetFields) {
      if (!(field in dataset)) errors.push(`${dataset.id ?? "unknown"} missing field: ${field}`);
    }
    if (ids.has(dataset.id)) errors.push(`duplicate dataset id: ${dataset.id}`);
    ids.add(dataset.id);
    if (!domains.has(dataset.domain)) errors.push(`${dataset.id} unknown domain: ${dataset.domain}`);
    if (!categories.has(dataset.category)) errors.push(`${dataset.id} unknown category: ${dataset.category}`);
    if (!licenses.has(dataset.license)) errors.push(`${dataset.id} unknown license: ${dataset.license}`);
    for (const format of dataset.formats ?? []) if (!formats.has(format)) errors.push(`${dataset.id} unknown format: ${format}`);
    for (const task of dataset.tasks ?? []) if (!tasks.has(task)) errors.push(`${dataset.id} unknown task: ${task}`);
    for (const receipt of dataset.receipts ?? []) if (!receipts.has(receipt)) warnings.push(`${dataset.id} references receipt not in receipts.json: ${receipt}`);

    const packagePath = findDatasetPackage(dataset.id);
    if (!packagePath) warnings.push(`${dataset.id} has no package folder under datasets/`);
    if (packagePath && !existsSync(resolve(root, packagePath, "manifest.json"))) warnings.push(`${dataset.id} package missing manifest.json`);
    if (packagePath && !existsSync(resolve(root, packagePath, "dataset.card.md"))) warnings.push(`${dataset.id} package missing dataset.card.md`);
  }

  printResults("validate", errors, warnings);
}

function findDatasetPackage(id) {
  const candidates = [
    `datasets/cre/${id}`,
    `datasets/compute/${id}`,
    `datasets/medical/${id}`,
    `datasets/credit/${id}`,
    `datasets/gov/${id}`,
    `datasets/legal/${id}`,
    `datasets/energy/${id}`,
    `datasets/local/${id}`,
    `datasets/mining/${id}`,
    `datasets/general/${id}`,
  ];
  return candidates.find((candidate) => existsSync(resolve(root, candidate)));
}

function hashFiles(paths) {
  if (!paths.length) {
    console.error("Usage: defendable-datasets hash <file...>");
    process.exit(2);
  }
  for (const path of paths) {
    const fullPath = resolve(root, path);
    const hash = createHash("sha256").update(readFileSync(fullPath)).digest("hex");
    const size = statSync(fullPath).size;
    console.log(`${hash}  ${path}  ${size}`);
  }
}

function pack(ids) {
  if (!ids.length) {
    console.error("Usage: defendable-datasets pack <dataset-id...> [--out file.json]");
    process.exit(2);
  }
  const outIndex = ids.indexOf("--out");
  const outPath = outIndex >= 0 ? ids[outIndex + 1] : "";
  const selectedIds = outIndex >= 0 ? ids.slice(0, outIndex) : ids;
  const { datasets } = loadRegistry();
  const selected = selectedIds.map((id) => datasets.find((dataset) => dataset.id === id || dataset.slug === id));
  const missing = selectedIds.filter((_, index) => !selected[index]);
  if (missing.length) {
    console.error(`Unknown dataset ids: ${missing.join(", ")}`);
    process.exit(1);
  }
  const manifest = {
    pack_id: `cli_pack_${Date.now().toString(36)}`,
    name: "DefendableDatasets CLI Pack",
    created_at: new Date().toISOString(),
    datasets: selected,
    total_record_count: selected.reduce((sum, dataset) => sum + dataset.record_count, 0),
    total_size_bytes: selected.reduce((sum, dataset) => sum + dataset.size_bytes, 0),
    licenses: [...new Set(selected.map((dataset) => dataset.license))],
    formats: [...new Set(selected.flatMap((dataset) => dataset.formats))],
    tasks: [...new Set(selected.flatMap((dataset) => dataset.tasks))],
    hashes: [...new Set(selected.flatMap((dataset) => dataset.hashes))],
  };
  const content = JSON.stringify(manifest, null, 2);
  if (outPath) writeFileSync(resolve(root, outPath), `${content}\n`);
  else console.log(content);
}

function printResults(label, errors, warnings) {
  for (const warning of warnings) console.warn(`warn: ${warning}`);
  for (const error of errors) console.error(`error: ${error}`);
  if (errors.length) {
    console.error(`${label} failed: ${errors.length} errors, ${warnings.length} warnings`);
    process.exit(1);
  }
  console.log(`${label} passed: ${warnings.length} warnings`);
}

const [command, ...args] = process.argv.slice(2);
if (command === "validate") validate();
else if (command === "hash") hashFiles(args);
else if (command === "pack") pack(args);
else {
  console.log(`DefendableDatasets CLI

Usage:
  defendable-datasets validate
  defendable-datasets hash <file...>
  defendable-datasets pack <dataset-id...> [--out file.json]
`);
}
