import Link from "next/link";
import { Download } from "lucide-react";
import { AddToPackButton } from "@/components/AddToPackButton";
import { CopyButton } from "@/components/CopyButton";
import { Badge, statusClass } from "@/components/ui";
import { categories, datasets, domains, formatBytes, formatNumber, labelFor } from "@/lib/registry/data";

export default function RegistryPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">Dataset Registry</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            A static v0 registry of demo datasets, ready to promote into verified assets as real files and receipts land.
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[.045] px-4 py-3 text-sm text-slate-300">
          {datasets.length} datasets indexed
        </div>
      </div>
      <div className="mt-8 overflow-x-auto rounded-md border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/[.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              {["Dataset", "Domain", "Category", "Version", "Formats", "License", "Records", "Size", "Quality", "Status", "Last updated", "Actions"].map((header) => (
                <th key={header} className="px-4 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {datasets.map((dataset) => (
              <tr key={dataset.id} className="bg-[#0a0f15]/70 align-top transition hover:bg-white/[.055]">
                <td className="px-4 py-4">
                  <Link href={`/datasets/${dataset.id}`} className="font-semibold text-white hover:text-amber-200">{dataset.title}</Link>
                  <div className="mt-1 max-w-sm text-xs text-slate-500">{dataset.id}</div>
                </td>
                <td className="px-4 py-4 text-slate-300">{labelFor(domains, dataset.domain)}</td>
                <td className="px-4 py-4 text-slate-300">{labelFor(categories, dataset.category)}</td>
                <td className="px-4 py-4 text-slate-300">{dataset.version}</td>
                <td className="px-4 py-4"><div className="flex flex-wrap gap-1">{dataset.formats.map((format) => <Badge key={format}>{format}</Badge>)}</div></td>
                <td className="px-4 py-4 text-slate-300">{dataset.license}</td>
                <td className="px-4 py-4 text-slate-300">{formatNumber(dataset.record_count)}</td>
                <td className="px-4 py-4 text-slate-300">{formatBytes(dataset.size_bytes)}</td>
                <td className="px-4 py-4 text-slate-300">{dataset.quality_score}</td>
                <td className="px-4 py-4"><Badge className={statusClass(dataset.status)}>{dataset.status}</Badge></td>
                <td className="px-4 py-4 text-slate-300">{new Date(dataset.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <div className="flex min-w-44 flex-wrap gap-2">
                    <Link href={`/datasets/${dataset.id}`} className="rounded-md border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10">View</Link>
                    <AddToPackButton dataset={dataset} />
                    <CopyButton label="Copy manifest" value={JSON.stringify(dataset, null, 2)} />
                    <a
                      href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataset, null, 2))}`}
                      download={`${dataset.id}.metadata.json`}
                      className="rounded-md border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      <Download className="size-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
