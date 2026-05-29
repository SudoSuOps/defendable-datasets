"use client";

import { Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { buildPackManifest } from "@/lib/pack/buildPackManifest";
import { downloadText, renderPackExport, type PackExportKind } from "@/lib/pack/exportPack";
import { formatBytes, formatNumber } from "@/lib/registry/data";
import { usePack } from "./PackProvider";
import { Badge, Panel } from "./ui";
import { DOWNLOADS_PER_EMAIL_LIMIT } from "@/lib/access/downloadPolicy";

const exports: PackExportKind[] = [
  "pack.manifest.json",
  "hf_dataset_card.md",
  "fine_tune_manifest.json",
  "sha256_manifest.json",
  "README.md",
];

export function PackWorkspace() {
  const { datasets, removeDataset, clearPack } = usePack();
  const manifest = buildPackManifest(datasets);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">Pack Builder</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Compose datasets into a reviewable pack and export manifests directly from the browser.
          </p>
        </div>
        <button onClick={clearPack} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-100 hover:bg-white/10">
          Clear pack
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Panel><div className="text-2xl font-semibold">{datasets.length}</div><div className="text-sm text-slate-400">Datasets</div></Panel>
        <Panel><div className="text-2xl font-semibold">{formatNumber(manifest.total_record_count)}</div><div className="text-sm text-slate-400">Records</div></Panel>
        <Panel><div className="text-2xl font-semibold">{formatBytes(manifest.total_size_bytes)}</div><div className="text-sm text-slate-400">Size</div></Panel>
        <Panel><div className="text-2xl font-semibold">{manifest.licenses.length}</div><div className="text-sm text-slate-400">Licenses</div></Panel>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {datasets.length ? datasets.map((dataset) => (
            <div key={dataset.id} className="rounded-md border border-white/10 bg-white/[.045] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-semibold text-white">{dataset.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{dataset.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{dataset.license}</Badge>
                    {dataset.formats.map((format) => <Badge key={format}>{format}</Badge>)}
                    {dataset.tasks.slice(0, 3).map((task) => <Badge key={task}>{task}</Badge>)}
                  </div>
                </div>
                <button onClick={() => removeDataset(dataset.id)} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10">
                  <Trash2 className="size-4" /> Remove
                </button>
              </div>
            </div>
          )) : (
            <Panel className="rounded-md">
              <h2 className="font-semibold text-white">No datasets selected</h2>
              <p className="mt-2 text-sm text-slate-400">Add datasets from the graph, registry, or detail pages.</p>
            </Panel>
          )}
        </div>
        <Panel className="rounded-md">
          <h2 className="font-semibold text-white">Export Options</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Metadata exports are generated in this browser. Production file downloads are gated at {DOWNLOADS_PER_EMAIL_LIMIT} downloads per email.
          </p>
          <div className="mt-4 grid gap-2">
            {exports.map((kind) => (
              <button
                key={kind}
                onClick={() => downloadText(kind, renderPackExport(manifest, kind), kind.endsWith(".json") ? "application/json" : "text/markdown")}
                disabled={!datasets.length}
                className="inline-flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {kind}
                <Download className="size-4" />
              </button>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-semibold text-white">Warnings</h3>
          <ul className="mt-3 space-y-2 text-sm text-amber-100">
            {manifest.warnings.map((warning) => <li key={warning}>{warning}</li>)}
            {!manifest.warnings.length ? <li className="text-emerald-100">No pack warnings generated.</li> : null}
          </ul>
          <Link href="/access" className="mt-5 inline-flex w-full items-center justify-center rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-300/15">
            Review access policy
          </Link>
        </Panel>
      </div>
    </div>
  );
}
