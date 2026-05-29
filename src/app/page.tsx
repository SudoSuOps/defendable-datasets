import { ArrowRight, Database, FileCheck2, GitBranch, Package } from "lucide-react";
import { datasets, domains, formatBytes, formatNumber } from "@/lib/registry/data";
import { ButtonLink, Panel } from "@/components/ui";

export default function Home() {
  const records = datasets.reduce((sum, dataset) => sum + dataset.record_count, 0);
  const size = datasets.reduce((sum, dataset) => sum + dataset.size_bytes, 0);

  return (
    <main>
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <div className="inline-flex rounded-md border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-sm text-amber-100">
              No proof, no honey.
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-normal text-white sm:text-7xl">
              Open datasets with receipts.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Browse, verify, compose, and export fine-tune-ready datasets from a living graph.
              Community datasets organized by domain, category, license, format, and proof.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/graph">Open Dataset Graph</ButtonLink>
              <ButtonLink href="/registry" variant="secondary">
                View Registry
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-md border border-white/10 bg-[#0b1118] p-5 shadow-2xl shadow-black/30">
            <GraphPreview />
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          <Stat icon={Database} label="Demo datasets" value={datasets.length.toString()} />
          <Stat icon={GitBranch} label="Seed domains" value={domains.length.toString()} />
          <Stat icon={FileCheck2} label="Registry records" value={formatNumber(records)} />
          <Stat icon={Package} label="Estimated size" value={formatBytes(size)} />
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.03] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-white">Why this exists</h2>
            <p className="mt-4 text-slate-300">
              AI builders need dataset assets they can inspect, cite, hash, package, and reuse.
              DefendableDatasets starts as a local registry and graph, then grows into the open dataset
              layer for DefendableCloud and DefendableOS.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Pillar title="Discover datasets" text="Browse by domain, category, format, license, task target, status, quality, and model family." />
            <Pillar title="Verify provenance" text="Receipts, hashes, validation state, and source summaries sit beside the data instead of in a forgotten spreadsheet." />
            <Pillar title="Compose fine-tune packs" text="Select multiple datasets and export manifests, cards, README snippets, and SHA256 files client-side." />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <Panel>
            <h2 className="text-2xl font-semibold text-white">Free for the community</h2>
            <p className="mt-4 text-slate-300">
              The public commons starts with demo registry entries and a clean contribution path.
              Real datasets can be added with proof, license clarity, reproducible metadata, and file hashes.
            </p>
          </Panel>
          <Panel>
            <h2 className="text-2xl font-semibold text-white">Built for DefendableCloud members, open to builders</h2>
            <p className="mt-4 text-slate-300">
              v0 has no auth or payment wall. The architecture leaves room for member-only storage,
              signed receipts, object backends, API access, and fine-tune job handoff.
            </p>
          </Panel>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">Doctrine</div>
            <div className="mt-2 text-3xl font-semibold text-white">Receipts over vibes. Datasets are the asset.</div>
          </div>
          <ButtonLink href="/docs" variant="secondary">
            Read the docs <ArrowRight className="ml-2 size-4" />
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Database; label: string; value: string }) {
  return (
    <Panel className="rounded-md">
      <Icon className="size-5 text-teal-200" />
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </Panel>
  );
}

function Pillar({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#0c1219] p-5">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function GraphPreview() {
  const points = [
    ["Domain", "left-[8%] top-[18%]", "bg-amber-300"],
    ["Category", "left-[34%] top-[32%]", "bg-teal-300"],
    ["Dataset", "left-[58%] top-[20%]", "bg-sky-300"],
    ["Receipt", "left-[74%] top-[52%]", "bg-amber-200"],
    ["Format", "left-[42%] top-[70%]", "bg-rose-300"],
    ["Task", "left-[18%] top-[58%]", "bg-blue-300"],
  ];
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.12)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M90 85 L210 140 L340 95 L415 235 L250 310 L120 250 Z" fill="none" stroke="rgba(148,163,184,.35)" strokeWidth="2" />
      </svg>
      {points.map(([label, position, color]) => (
        <div key={label} className={`absolute ${position} rounded-md border border-white/15 bg-[#111923] px-4 py-3 shadow-xl`}>
          <div className={`mb-2 size-2 rounded-full ${color}`} />
          <div className="text-sm font-semibold text-white">{label}</div>
        </div>
      ))}
    </div>
  );
}
