import { notFound } from "next/navigation";
import { AddToPackButton } from "@/components/AddToPackButton";
import { CopyButton } from "@/components/CopyButton";
import { Badge, Panel, statusClass } from "@/components/ui";
import { categories, datasets, domains, formatBytes, formatNumber, getDatasetBySlug, labelFor, receipts } from "@/lib/registry/data";
import { buildPackManifest } from "@/lib/pack/buildPackManifest";
import { renderDatasetCard } from "@/lib/pack/exportPack";

export function generateStaticParams() {
  return datasets.flatMap((dataset) => [{ id: dataset.id }, { id: dataset.slug }]);
}

export default async function DatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dataset = getDatasetBySlug(id);
  if (!dataset) notFound();
  const card = renderDatasetCard(buildPackManifest([dataset], { name: dataset.title, description: dataset.description }));
  const datasetReceipts = receipts.filter((receipt) => dataset.receipts.includes(receipt.id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="flex flex-wrap gap-2">
            <Badge className={statusClass(dataset.status)}>{dataset.status}</Badge>
            <Badge>{dataset.access}</Badge>
            <Badge>{dataset.license}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white">{dataset.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{dataset.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <AddToPackButton dataset={dataset} />
            <CopyButton label="Copy metadata JSON" value={JSON.stringify(dataset, null, 2)} />
            <a href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataset, null, 2))}`} download={`${dataset.id}.json`} className="rounded-md border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10">
              Download metadata JSON
            </a>
          </div>
        </section>
        <Panel className="rounded-md">
          <h2 className="font-semibold text-white">Asset Snapshot</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Row label="Domain" value={labelFor(domains, dataset.domain)} />
            <Row label="Category" value={labelFor(categories, dataset.category)} />
            <Row label="Version" value={dataset.version} />
            <Row label="Records" value={formatNumber(dataset.record_count)} />
            <Row label="Size" value={formatBytes(dataset.size_bytes)} />
            <Row label="Quality" value={`${dataset.quality_score}/100`} />
            <Row label="Validation" value={dataset.validation.status} />
          </dl>
        </Panel>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel className="rounded-md"><h2 className="font-semibold text-white">Intended Use</h2><p className="mt-3 text-sm leading-6 text-slate-300">{dataset.intended_use}</p></Panel>
        <Panel className="rounded-md"><h2 className="font-semibold text-white">Not Intended Use</h2><p className="mt-3 text-sm leading-6 text-slate-300">{dataset.not_intended_use}</p></Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <Panel className="rounded-md">
          <h2 className="font-semibold text-white">Schema Preview</h2>
          <pre className="mt-4 overflow-auto rounded-md bg-black/30 p-4 text-xs text-slate-300">{JSON.stringify(dataset.example_records[0] ?? {}, null, 2)}</pre>
          <h2 className="mt-6 font-semibold text-white">Example Records</h2>
          <pre className="mt-4 overflow-auto rounded-md bg-black/30 p-4 text-xs text-slate-300">{JSON.stringify(dataset.example_records, null, 2)}</pre>
        </Panel>
        <Panel className="rounded-md">
          <h2 className="font-semibold text-white">Formats and Tasks</h2>
          <div className="mt-4 flex flex-wrap gap-2">{[...dataset.formats, ...dataset.tasks, ...dataset.compatible_models].map((item) => <Badge key={item}>{item}</Badge>)}</div>
          <h2 className="mt-6 font-semibold text-white">Fine-tuning Notes</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{dataset.provenance_summary}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">{dataset.validation.summary}</p>
        </Panel>
      </div>

      <Panel className="mt-6 rounded-md">
        <h2 className="font-semibold text-white">Files, Hashes, and Receipts</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <tbody className="divide-y divide-white/10">
              {dataset.files.map((file) => (
                <tr key={file.id}>
                  <td className="py-3 pr-4 text-white">{file.path}</td>
                  <td className="py-3 pr-4 text-slate-300">{file.format}</td>
                  <td className="py-3 pr-4 text-slate-300">{file.split}</td>
                  <td className="py-3 pr-4 text-slate-300">{formatBytes(file.size_bytes)}</td>
                  <td className="py-3 font-mono text-xs text-amber-100">{file.sha256}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-3">
          {datasetReceipts.length ? datasetReceipts.map((receipt) => (
            <div key={receipt.id} className="rounded-md border border-white/10 bg-white/[.04] p-3 text-sm text-slate-300">
              <div className="font-semibold text-white">{receipt.type}: {receipt.id}</div>
              <div className="mt-1">{receipt.summary}</div>
            </div>
          )) : <p className="text-sm text-slate-400">Receipt IDs are reserved in metadata; full receipt documents are pending.</p>}
        </div>
      </Panel>

      <Panel className="mt-6 rounded-md">
        <h2 className="font-semibold text-white">Dataset Card Preview</h2>
        <pre className="mt-4 overflow-auto rounded-md bg-black/30 p-4 text-xs text-slate-300">{card}</pre>
      </Panel>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}
