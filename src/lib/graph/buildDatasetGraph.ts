import {
  categories,
  datasets,
  domains,
  formats,
  labelFor,
  licenses,
  receipts,
  tasks,
} from "@/lib/registry/data";
import type { Dataset } from "@/lib/schema/dataset";
import type {
  DatasetGraph,
  DatasetGraphEdge,
  DatasetGraphFilters,
  DatasetGraphNode,
  GraphEdgeType,
  GraphNodeType,
} from "@/lib/schema/graph";

function matchesFilters(dataset: Dataset, filters: DatasetGraphFilters = {}) {
  const query = filters.query?.trim().toLowerCase();
  const searchable = [
    dataset.id,
    dataset.title,
    dataset.description,
    dataset.domain,
    dataset.category,
    dataset.license,
    ...dataset.formats,
    ...dataset.tasks,
    ...dataset.tags,
  ]
    .join(" ")
    .toLowerCase();

  return (
    (!query || searchable.includes(query)) &&
    (!filters.domain || dataset.domain === filters.domain) &&
    (!filters.format || dataset.formats.includes(filters.format)) &&
    (!filters.license || dataset.license === filters.license) &&
    (!filters.task || dataset.tasks.includes(filters.task)) &&
    (!filters.status || dataset.status === filters.status) &&
    (!filters.minQuality || dataset.quality_score >= filters.minQuality)
  );
}

export function filterDatasets(filters: DatasetGraphFilters = {}) {
  return datasets.filter((dataset) => matchesFilters(dataset, filters));
}

export function buildDatasetGraph(filters: DatasetGraphFilters = {}): DatasetGraph {
  const visibleDatasets = filterDatasets(filters);
  const nodeMap = new Map<string, DatasetGraphNode>();
  const edgeMap = new Map<string, DatasetGraphEdge>();

  const addNode = (node: DatasetGraphNode) => {
    if (!nodeMap.has(node.id)) nodeMap.set(node.id, node);
  };

  const addEdge = (source: string, target: string, type: GraphEdgeType, label?: string) => {
    const id = `${source}:${type}:${target}`;
    if (!edgeMap.has(id)) edgeMap.set(id, { id, source, target, type, label });
  };

  visibleDatasets.forEach((dataset) => {
    const domain = domains.find((item) => item.id === dataset.domain);
    const category = categories.find((item) => item.id === dataset.category);
    const license = licenses.find((item) => item.id === dataset.license);

    addNode({
      id: `domain:${dataset.domain}`,
      type: "DOMAIN",
      label: domain?.name ?? dataset.domain,
      summary: domain?.description,
      domain: dataset.domain,
    });
    addNode({
      id: `category:${dataset.category}`,
      type: "CATEGORY",
      label: category?.name ?? dataset.category,
      summary: `Category in ${labelFor(domains, dataset.domain)}`,
      domain: dataset.domain,
      category: dataset.category,
    });
    addNode({
      id: `dataset:${dataset.id}`,
      type: "DATASET",
      label: dataset.title,
      summary: dataset.description,
      datasetId: dataset.id,
      domain: dataset.domain,
      category: dataset.category,
      status: dataset.status,
      quality: dataset.quality_score,
      meta: {
        records: dataset.record_count,
        access: dataset.access,
        source_type: dataset.source_type,
        nas_backed: Boolean(dataset.external_locations?.length),
      },
    });
    addNode({
      id: `version:${dataset.id}:${dataset.version}`,
      type: "VERSION",
      label: dataset.version,
      summary: `Version for ${dataset.title}`,
      datasetId: dataset.id,
    });
    addNode({
      id: `license:${dataset.license}`,
      type: "LICENSE",
      label: license?.name ?? dataset.license,
      summary: license?.commercial_use ? "Commercial use allowed" : "Review required before commercial use",
    });

    addEdge(`domain:${dataset.domain}`, `category:${dataset.category}`, "CONTAINS");
    addEdge(`category:${dataset.category}`, `dataset:${dataset.id}`, "CONTAINS");
    addEdge(`dataset:${dataset.id}`, `domain:${dataset.domain}`, "BELONGS_TO");
    addEdge(`dataset:${dataset.id}`, `version:${dataset.id}:${dataset.version}`, "HAS_VERSION");
    addEdge(`dataset:${dataset.id}`, `license:${dataset.license}`, "LICENSED_AS");

    dataset.formats.forEach((formatId) => {
      const format = formats.find((item) => item.id === formatId);
      addNode({
        id: `format:${formatId}`,
        type: "FORMAT",
        label: format?.name ?? formatId,
        summary: format?.extension,
      });
      addEdge(`dataset:${dataset.id}`, `format:${formatId}`, "AVAILABLE_AS");
    });

    dataset.tasks.forEach((taskId) => {
      const task = tasks.find((item) => item.id === taskId);
      addNode({
        id: `task:${taskId}`,
        type: "TASK",
        label: task?.name ?? taskId,
        summary: "Supported model target or workflow.",
      });
      addEdge(`dataset:${dataset.id}`, `task:${taskId}`, "SUPPORTS_TASK");
    });

    dataset.files.forEach((file) => {
      addNode({
        id: `file:${file.id}`,
        type: "FILE",
        label: file.path.split("/").pop() ?? file.id,
        summary: `${file.record_count.toLocaleString()} records, ${file.split} split`,
        datasetId: dataset.id,
        meta: file,
      });
      addEdge(`version:${dataset.id}:${dataset.version}`, `file:${file.id}`, "HAS_FILE");
    });

    dataset.receipts.forEach((receiptId) => {
      const receipt = receipts.find((item) => item.id === receiptId);
      addNode({
        id: `receipt:${receiptId}`,
        type: "RECEIPT",
        label: receiptId,
        summary: receipt?.summary ?? "Receipt placeholder",
        datasetId: dataset.id,
        meta: receipt,
      });
      addEdge(`dataset:${dataset.id}`, `receipt:${receiptId}`, "VERIFIED_BY");
    });
  });

  return {
    nodes: [...nodeMap.values()],
    edges: [...edgeMap.values()],
  };
}

export const nodeTypeLabels: Record<GraphNodeType, string> = {
  DOMAIN: "Domain",
  CATEGORY: "Category",
  DATASET: "Dataset",
  VERSION: "Version",
  FILE: "File",
  LICENSE: "License",
  FORMAT: "Format",
  TASK: "Task",
  RECEIPT: "Receipt",
};
