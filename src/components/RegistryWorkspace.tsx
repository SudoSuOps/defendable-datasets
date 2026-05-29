"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Filter, Search, SlidersHorizontal } from "lucide-react";
import { AddToPackButton } from "@/components/AddToPackButton";
import { CopyButton } from "@/components/CopyButton";
import { Badge, Panel, statusClass } from "@/components/ui";
import { formatBytes, formatNumber, labelFor } from "@/lib/registry/data";
import type { Category, Dataset, Domain, FormatDefinition, LicenseDefinition, TaskDefinition } from "@/lib/schema/dataset";

type RegistryWorkspaceProps = {
  datasets: Dataset[];
  domains: Domain[];
  categories: Category[];
  formats: FormatDefinition[];
  licenses: LicenseDefinition[];
  tasks: TaskDefinition[];
};

export function RegistryWorkspace({
  datasets,
  domains,
  categories,
  formats,
  licenses,
  tasks,
}: RegistryWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [format, setFormat] = useState("");
  const [license, setLicense] = useState("");
  const [task, setTask] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [minQuality, setMinQuality] = useState(0);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return datasets.filter((dataset) => {
      const haystack = [
        dataset.id,
        dataset.title,
        dataset.description,
        dataset.domain,
        dataset.category,
        dataset.license,
        dataset.status,
        dataset.source_type,
        ...dataset.formats,
        ...dataset.tasks,
        ...dataset.tags,
        ...dataset.compatible_models,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalized || haystack.includes(normalized)) &&
        (!domain || dataset.domain === domain) &&
        (!format || dataset.formats.includes(format)) &&
        (!license || dataset.license === license) &&
        (!task || dataset.tasks.includes(task)) &&
        (!status || dataset.status === status) &&
        (!source || (source === "nas" && Boolean(dataset.external_locations?.length))) &&
        dataset.quality_score >= minQuality
      );
    });
  }, [datasets, domain, format, license, minQuality, query, source, status, task]);

  const totals = useMemo(
    () => ({
      records: filtered.reduce((sum, dataset) => sum + dataset.record_count, 0),
      size: filtered.reduce((sum, dataset) => sum + dataset.size_bytes, 0),
      nas: filtered.filter((dataset) => dataset.external_locations?.length).length,
      verified: filtered.filter((dataset) => dataset.status === "verified").length,
    }),
    [filtered],
  );

  const reset = () => {
    setQuery("");
    setDomain("");
    setFormat("");
    setLicense("");
    setTask("");
    setStatus("");
    setSource("");
    setMinQuality(0);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-sm text-teal-100">
            <SlidersHorizontal className="size-4" />
            Registry workspace
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white">Dataset Registry</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Search, filter, inspect proof, and compose fine-tune packs from local registry metadata and NAS-backed assets.
          </p>
        </div>
        <button onClick={reset} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10">
          Reset filters
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Visible datasets" value={filtered.length.toString()} />
        <Metric label="Visible records" value={formatNumber(totals.records)} />
        <Metric label="Visible size" value={formatBytes(totals.size)} />
        <Metric label="NAS-backed" value={totals.nas.toString()} />
      </div>

      <Panel className="mt-6 rounded-md">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(7,minmax(0,1fr))]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, tag, task, model, source"
              className="w-full rounded-md border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-amber-200/60"
            />
          </label>
          <Select value={domain} onChange={setDomain} options={domains} placeholder="Domain" />
          <Select value={format} onChange={setFormat} options={formats} placeholder="Format" />
          <Select value={license} onChange={setLicense} options={licenses} placeholder="License" />
          <Select value={task} onChange={setTask} options={tasks} placeholder="Task" />
          <Select
            value={status}
            onChange={setStatus}
            options={[
              { id: "draft", name: "Draft" },
              { id: "verified", name: "Verified" },
              { id: "deprecated", name: "Deprecated" },
              { id: "archived", name: "Archived" },
            ]}
            placeholder="Status"
          />
          <Select value={source} onChange={setSource} options={[{ id: "nas", name: "NAS-backed" }]} placeholder="Source" />
          <label className="grid gap-1 text-xs text-slate-400">
            Quality {minQuality}+
            <input
              type="range"
              min="0"
              max="100"
              value={minQuality}
              onChange={(event) => setMinQuality(Number(event.target.value))}
              className="h-9 accent-amber-300"
            />
          </label>
        </div>
      </Panel>

      <div className="mt-6 grid gap-4">
        {filtered.map((dataset) => (
          <article key={dataset.id} className="rounded-md border border-white/10 bg-[#0a0f15]/82 p-4 transition hover:border-amber-200/30 hover:bg-white/[.055]">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusClass(dataset.status)}>{dataset.status}</Badge>
                  {dataset.external_locations?.length ? <Badge className="border-sky-300/30 bg-sky-300/10 text-sky-100">NAS proof</Badge> : null}
                  <Badge>{dataset.license}</Badge>
                  <Badge>{dataset.access}</Badge>
                </div>
                <Link href={`/datasets/${dataset.id}`} className="mt-3 block text-xl font-semibold text-white transition hover:text-amber-200">
                  {dataset.title}
                </Link>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">{dataset.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{labelFor(domains, dataset.domain)}</Badge>
                  <Badge>{labelFor(categories, dataset.category)}</Badge>
                  {dataset.formats.map((item) => <Badge key={item}>{item}</Badge>)}
                  {dataset.tasks.slice(0, 4).map((item) => <Badge key={item}>{item}</Badge>)}
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Mini label="Records" value={dataset.record_count ? formatNumber(dataset.record_count) : "pending"} />
                  <Mini label="Size" value={formatBytes(dataset.size_bytes)} />
                  <Mini label="Quality" value={`${dataset.quality_score}/100`} />
                  <Mini label="Hashes" value={dataset.hashes.length.toString()} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/datasets/${dataset.id}`} className="rounded-md border border-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/10">
                    View
                  </Link>
                  <AddToPackButton dataset={dataset} />
                  <CopyButton label="Copy" value={JSON.stringify(dataset, null, 2)} />
                  <a
                    href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataset, null, 2))}`}
                    download={`${dataset.id}.metadata.json`}
                    className="rounded-md border border-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                    aria-label={`Download ${dataset.title} metadata JSON`}
                  >
                    <Download className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
        {!filtered.length ? (
          <Panel className="rounded-md">
            <Filter className="size-5 text-amber-200" />
            <h2 className="mt-3 font-semibold text-white">No datasets match those filters</h2>
            <p className="mt-2 text-sm text-slate-400">Relax one filter or reset the workspace.</p>
          </Panel>
        ) : null}
      </div>
    </main>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-white/10 bg-[#101720] px-3 text-sm text-slate-100 outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Panel className="rounded-md">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </Panel>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-semibold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
