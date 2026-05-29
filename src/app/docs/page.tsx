import { Badge, Panel } from "@/components/ui";

const roadmap = [
  "Real dataset file hosting",
  "Hugging Face sync",
  "S3/object storage backend",
  "DefendableCloud member access",
  "Dataset signing",
  "Merkle proofs",
  "Dataset quality evaluator",
  "CLI: defendable-datasets validate",
  "CLI: defendable-datasets pack",
  "API access",
  "Fine-tune job handoff",
  "Model compatibility scoring",
  "Dataset lineage graph",
  "Dataset license compatibility checker",
];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Badge>Documentation</Badge>
      <h1 className="mt-4 text-4xl font-semibold text-white">DefendableDatasets docs</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        DefendableDatasets is a static-first dataset store, registry, graph browser, selector,
        verifier, and export system for AI builders.
      </p>

      <div className="mt-8 grid gap-6">
        <Doc title="Registry Schema" text="Registry JSON lives under /data/registry. Datasets include identity, license, formats, tasks, source summary, validation, files, hashes, receipts, examples, citation, and model compatibility." />
        <Doc title="Graph Schema" text="The graph contains DOMAIN, CATEGORY, DATASET, VERSION, FILE, LICENSE, FORMAT, TASK, and RECEIPT nodes connected by typed edges such as CONTAINS, HAS_FILE, LICENSED_AS, AVAILABLE_AS, SUPPORTS_TASK, and VERIFIED_BY." />
        <Doc title="How to Add a Dataset" text="Add a registry entry, create a dataset folder under /datasets/[domain]/[dataset_id], include manifest.json, dataset.card.md, samples, receipts, and split files where licensing allows." />
        <Doc title="How to Export a Pack" text="Use the graph, registry, or detail page to add datasets to the pack. The pack page exports pack.manifest.json, hf_dataset_card.md, fine_tune_manifest.json, sha256_manifest.json, and README snippets." />
        <Doc title="How Receipts Work" text="Receipts are proof objects that describe hashes, validation runs, license checks, provenance summaries, or future Merkle proofs. v0 includes demo placeholders; verified datasets require real receipt files." />
        <Doc title="License Policy" text="Every dataset must declare a license and whether commercial use is allowed. Packs warn when demo or restricted licenses are mixed into exports." />
      </div>

      <Panel className="mt-6 rounded-md">
        <h2 className="font-semibold text-white">Roadmap</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {roadmap.map((item) => <div key={item} className="rounded-md border border-white/10 bg-white/[.04] px-3 py-2 text-sm text-slate-300">{item}</div>)}
        </div>
      </Panel>
    </main>
  );
}

function Doc({ title, text }: { title: string; text: string }) {
  return (
    <Panel className="rounded-md">
      <h2 className="font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
    </Panel>
  );
}
