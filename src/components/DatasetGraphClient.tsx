"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RotateCcw, Search, Target } from "lucide-react";
import { buildDatasetGraph, nodeTypeLabels } from "@/lib/graph/buildDatasetGraph";
import { datasets, domains, formats, licenses, tasks } from "@/lib/registry/data";
import type { Dataset } from "@/lib/schema/dataset";
import type { DatasetGraphFilters, DatasetGraphNode } from "@/lib/schema/graph";
import { usePack } from "./PackProvider";
import { Badge, statusClass } from "./ui";

const typeColor: Record<string, string> = {
  DOMAIN: "#fbbf24",
  CATEGORY: "#2dd4bf",
  DATASET: "#38bdf8",
  VERSION: "#a78bfa",
  FILE: "#94a3b8",
  LICENSE: "#34d399",
  FORMAT: "#fb7185",
  TASK: "#60a5fa",
  RECEIPT: "#f59e0b",
};

function GraphNode({ data }: { data: DatasetGraphNode }) {
  const isVerifiedDataset = data.type === "DATASET" && data.status === "verified";
  const isNasBacked = Boolean(data.meta?.nas_backed);
  return (
    <div
      className="min-w-36 max-w-60 rounded-md border bg-[#0d141d]/95 px-3 py-2 text-left shadow-xl"
      style={{
        borderColor: isVerifiedDataset ? "#34d399" : `${typeColor[data.type]}88`,
        boxShadow: isVerifiedDataset
          ? "0 0 28px rgba(52, 211, 153, 0.22)"
          : isNasBacked
            ? "0 0 24px rgba(56, 189, 248, 0.18)"
            : undefined,
      }}
      title={data.summary}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: typeColor[data.type] }}>
        {nodeTypeLabels[data.type]}
      </div>
      <div className="mt-1 line-clamp-2 text-sm font-semibold text-white">{data.label}</div>
      {data.quality ? <div className="mt-1 text-xs text-slate-400">Quality {data.quality}</div> : null}
      {isVerifiedDataset ? <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">Verified</div> : null}
      {isNasBacked ? <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-sky-200">NAS indexed</div> : null}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

const nodeTypes = { graphNode: GraphNode };

function layout(nodes: DatasetGraphNode[]): Node[] {
  const levels: Record<string, number> = {
    DOMAIN: 0,
    CATEGORY: 1,
    DATASET: 2,
    VERSION: 3,
    FILE: 4,
    LICENSE: 3,
    FORMAT: 3,
    TASK: 4,
    RECEIPT: 4,
  };
  const counts = new Map<number, number>();
  return nodes.map((node) => {
    const level = levels[node.type] ?? 0;
    const index = counts.get(level) ?? 0;
    counts.set(level, index + 1);
    return {
      id: node.id,
      type: "graphNode",
      data: node,
      position: {
        x: level * 310 + (index % 2) * 34,
        y: index * 128 + (level % 2) * 48,
      },
    };
  });
}

function selectDataset(node?: DatasetGraphNode | null) {
  if (!node?.datasetId) return null;
  return datasets.find((dataset) => dataset.id === node.datasetId) ?? null;
}

export function DatasetGraphClient() {
  const [filters, setFilters] = useState<DatasetGraphFilters>({});
  const [selected, setSelected] = useState<DatasetGraphNode | null>(null);
  const { addDataset, ids } = usePack();
  const flow = useReactFlow();

  const graph = useMemo(() => buildDatasetGraph(filters), [filters]);
  const nodes = useMemo(() => layout(graph.nodes), [graph.nodes]);
  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: edge.type === "VERIFIED_BY" || edge.type === "SUPPORTS_TASK",
        style: { stroke: "#334155" },
      })),
    [graph.edges],
  );
  const selectedDataset = selectDataset(selected);

  const setFilter = (key: keyof DatasetGraphFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  };

  const reset = () => {
    setFilters({});
    setSelected(null);
    window.requestAnimationFrame(() => flow.fitView({ padding: 0.18 }));
  };

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelected(node.data as DatasetGraphNode);
  }, []);

  return (
    <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 lg:grid-cols-[320px_1fr_360px]">
      <aside className="border-b border-white/10 bg-black/20 p-4 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Search className="size-4 text-amber-200" />
          Graph Filters
        </div>
        <input
          value={filters.query ?? ""}
          onChange={(event) => setFilter("query", event.target.value)}
          placeholder="Search datasets, tasks, tags"
          className="mt-4 w-full rounded-md border border-white/10 bg-white/[.06] px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 focus:border-amber-200/60"
        />
        <div className="mt-4 grid gap-3">
          <Select label="Domain" value={filters.domain} onChange={(value) => setFilter("domain", value)} options={domains} />
          <Select label="Format" value={filters.format} onChange={(value) => setFilter("format", value)} options={formats} />
          <Select label="License" value={filters.license} onChange={(value) => setFilter("license", value)} options={licenses} />
          <Select label="Task" value={filters.task} onChange={(value) => setFilter("task", value)} options={tasks} />
          <Select
            label="Status"
            value={filters.status}
            onChange={(value) => setFilter("status", value)}
            options={[
              { id: "draft", name: "Draft" },
              { id: "verified", name: "Verified" },
              { id: "deprecated", name: "Deprecated" },
              { id: "archived", name: "Archived" },
            ]}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10">
            <RotateCcw className="size-4" /> Reset
          </button>
          <button onClick={() => flow.fitView({ padding: 0.18 })} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10">
            <Target className="size-4" /> Fit
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
          <Metric label="Nodes" value={graph.nodes.length} />
          <Metric label="Edges" value={graph.edges.length} />
          <Metric label="Datasets" value={graph.nodes.filter((node) => node.type === "DATASET").length} />
          <Metric label="Selected" value={ids.size} />
        </div>
      </aside>
      <main className="h-[72vh] min-h-[640px] lg:h-[calc(100vh-65px)]">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={onNodeClick} fitView minZoom={0.15} maxZoom={1.4}>
          <Background color="#334155" gap={28} />
          <MiniMap nodeColor={(node) => typeColor[(node.data as DatasetGraphNode).type] ?? "#64748b"} pannable zoomable />
          <Controls />
        </ReactFlow>
      </main>
      <aside className="border-t border-white/10 bg-[#070a0f]/92 p-5 lg:border-l lg:border-t-0">
        {selected ? (
          <NodeDetail node={selected} dataset={selectedDataset} onAdd={addDataset} selected={selectedDataset ? ids.has(selectedDataset.id) : false} />
        ) : (
          <div className="rounded-md border border-white/10 bg-white/[.04] p-5">
            <div className="text-sm font-semibold text-white">Select a graph node</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Click domains, datasets, files, licenses, formats, tasks, or receipts to inspect metadata and compose a pack.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-slate-400">
      {label}
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-white/10 bg-[#101720] px-3 py-2 text-sm text-slate-100 outline-none"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[.045] p-3">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function NodeDetail({
  node,
  dataset,
  onAdd,
  selected,
}: {
  node: DatasetGraphNode;
  dataset: Dataset | null;
  onAdd: (dataset: Dataset) => void;
  selected: boolean;
}) {
  return (
    <div>
      <Badge>{nodeTypeLabels[node.type]}</Badge>
      <h2 className="mt-3 text-2xl font-semibold text-white">{node.label}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{node.summary ?? "No summary available."}</p>
      {dataset ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusClass(dataset.status)}>{dataset.status}</Badge>
            <Badge>{dataset.license}</Badge>
            <Badge>{dataset.record_count.toLocaleString()} records</Badge>
            <Badge>Quality {dataset.quality_score}</Badge>
          </div>
          <button
            onClick={() => onAdd(dataset)}
            disabled={selected}
            className="w-full rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {selected ? "Added to Pack" : "Add to Pack Builder"}
          </button>
          <a href={`/datasets/${dataset.id}`} className="block rounded-md border border-white/10 px-4 py-2 text-center text-sm text-white hover:bg-white/10">
            View Dataset Detail
          </a>
        </div>
      ) : null}
      <pre className="mt-5 max-h-80 overflow-auto rounded-md border border-white/10 bg-black/30 p-3 text-xs text-slate-300">
        {JSON.stringify(node.meta ?? node, null, 2)}
      </pre>
    </div>
  );
}
