import { Badge, Panel } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute",
  description: "Learn how to contribute datasets with metadata, licenses, provenance receipts, SHA256 hashes, samples, and split files.",
};

const required = [
  "id, title, slug, description, domain, category, version",
  "status, access, license, formats, tasks, language",
  "record_count, size_bytes, created_at, updated_at",
  "source_type, provenance_summary, intended_use, not_intended_use",
  "quality_score, validation, files, hashes, receipts",
  "tags, compatible_models, example_records, citation, links",
];

export default function ContributePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Badge>Contributor workflow</Badge>
      <h1 className="mt-4 text-4xl font-semibold text-white">Add datasets with proof</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        DefendableDatasets accepts registry-first contributions. Contributors add metadata, receipts,
        samples, and manifests through pull requests; large files move through NAS or object storage.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel className="rounded-md">
          <h2 className="font-semibold text-white">Required Metadata</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {required.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Panel>
        <Panel className="rounded-md">
          <h2 className="font-semibold text-white">License and Provenance</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Every dataset needs a license, source summary, receipt path, and SHA256 hashes for every file.
            Public records still need source URLs, retrieval dates, and terms review. Private or member data
            must stay out of public pull requests and route through gated access controls.
          </p>
        </Panel>
      </div>

      <Panel className="mt-6 rounded-md">
        <h2 className="font-semibold text-white">Dataset Folder Structure</h2>
        <pre className="mt-4 overflow-auto rounded-md bg-black/30 p-4 text-sm text-slate-300">{`datasets/
  cre/
    cre_underwriting_royal_jelly_v1/
      dataset.card.md
      manifest.json
      samples/
      receipts/
      splits/
  compute/
    compute_gpu_market_comps_v1/
      dataset.card.md
      manifest.json
      samples/
      receipts/
      splits/`}</pre>
      </Panel>

      <Panel className="mt-6 rounded-md">
        <h2 className="font-semibold text-white">Example PR Checklist</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li>Add or update `/data/registry/datasets.json`.</li>
          <li>Add `datasets/[domain]/[dataset_id]/manifest.json` and `dataset.card.md`.</li>
          <li>Add small samples under `samples/` and receipt files under `receipts/`.</li>
          <li>Put real train, validation, test, or full split files under `splits/` only when licensing permits.</li>
          <li>Run `npm run lint` and `npm run build` before opening the pull request.</li>
        </ul>
      </Panel>

      <Panel className="mt-6 rounded-md">
        <h2 className="font-semibold text-white">CLI Roadmap</h2>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Available commands: `defendable-datasets validate`, `defendable-datasets hash`,
          and `defendable-datasets pack`. Next command: `defendable-datasets receipt`.
        </p>
      </Panel>
    </main>
  );
}
