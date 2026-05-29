# DefendableDatasets

Open datasets with receipts.

Live: https://defendabledatasets.com

![DefendableDatasets social graph preview](public/og-image.png)

DefendableDatasets is the open-source dataset layer for the DefendableCloud / DefendableOS ecosystem. It is a static-first dataset registry, graph browser, selector, verifier, access surface, and export system for AI builders.

The live app lets users browse NAS-indexed and verified registry entries by domain, category, license, format, task type, quality score, source, and status; inspect dataset metadata; add datasets to a pack; and export manifests.

All current DefendableDatasets corpora were curated on sovereign bare-metal RTX 6000 fleet and RTX 3090 systems.

Doctrine: No proof, no honey.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Screenshots

The public launch pages are static and live at:

- Homepage: https://defendabledatasets.com
- Graph: https://defendabledatasets.com/graph
- Registry: https://defendabledatasets.com/registry
- Minechain detail: https://defendabledatasets.com/datasets/minechain_master_inventory_v1

## Deploy to Cloudflare Pages

This app is configured for static export to Cloudflare Pages.

```bash
source ~/.nvm/nvm.sh
nvm use 22
npm run cf:build
npm run cf:deploy
```

The Cloudflare project name is `defendable-datasets`, and the static output directory is `out`.

Custom domain:

```text
defendabledatasets.com
```

After Cloudflare auth is configured, bind the domain in Cloudflare Pages to the `defendable-datasets` project and point DNS at the Pages target Cloudflare provides.

## Key Routes

- `/` homepage for defendabledatasets.com
- `/graph` living dataset graph
- `/app/graph` graph alias
- `/registry` dataset table view
- `/datasets/[id]` dataset detail pages
- `/pack` client-side pack builder and exports
- `/access` dataset access request and download quota policy
- `/contribute` contributor workflow
- `/docs` schema, receipts, license policy, and roadmap

## Registry Data

Local registry files live in `/data/registry`:

- `datasets.json`
- `domains.json`
- `categories.json`
- `licenses.json`
- `formats.json`
- `tasks.json`
- `receipts.json`

Dataset asset packages live under `/datasets/[domain]/[dataset_id]` with:

- `dataset.card.md`
- `manifest.json`
- `samples/`
- `receipts/`
- `splits/`

Some entries include `external_locations` pointing at opaque `defendable-storage://` source IDs.
Those IDs document where controlled source assets live without committing large files or exposing internal storage topology in git.

## Dataset Access Controls

Public metadata stays open. Large files and gated corpora should be delivered through a download gateway, not direct static links.

Current policy:

- 500 successful file downloads per email per rolling 30-day window.
- Public metadata exports remain available from the static app.
- Gated files require an access request or member identity.
- The deployable Cloudflare Worker scaffold lives in `/workers/download-gate`.

## Support AI

The site includes a small customer-service assistant, Hack. The frontend calls same-origin `/api/help`.
On Cloudflare Pages, configure:

```text
HELP_AGENT_URL=https://your-ollama-compatible-agent-endpoint
HELP_AGENT_MODEL=hf.co/LiquidAI/LFM2.5-8B-A1B-GGUF:Q4_K_M
```

Keep the model host behind a Cloudflare Tunnel or Worker-accessible gateway. Do not expose LAN IPs or SSH services from the public site.

## CLI

Run registry checks and generate receipts before opening pull requests:

```bash
npm run registry:validate
npm run registry:hash -- datasets/general/minechain_master_inventory_v1/samples/sample.jsonl
npm run registry:pack -- minechain_master_inventory_v1 --out pack.manifest.json
```

Direct binary usage:

```bash
npx defendable-datasets validate
npx defendable-datasets hash <file...>
npx defendable-datasets pack <dataset-id...> [--out file.json]
```

## Quality Foundry

The Python `defdata` CLI manufactures defendable, model-ready datasets with schema validation, dedupe, deterministic grading, train/val/test splits, manifests, reports, SHA256 hashes, and receipts.

Install locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
```

End-to-end flow:

```bash
defdata init --dataset-id SWARM-DATA-20260528-CRE-V1 --domain cre
defdata ingest data/raw/sample_cre.jsonl --dataset-id SWARM-DATA-20260528-CRE-V1 --domain cre
defdata validate data/staged/sample_cre.staged.jsonl
defdata dedupe data/clean/sample_cre.valid.jsonl
defdata grade data/clean/sample_cre.deduped.jsonl --rubric configs/domains/cre.yaml
defdata split data/clean/sample_cre.graded.jsonl --train 0.90 --val 0.05 --test 0.05
defdata manifest data/exports/SWARM-DATA-20260528-CRE-V1/
defdata export --dataset-id SWARM-DATA-20260528-CRE-V1
```

Final packages include:

- `train.jsonl`, `val.jsonl`, `test.jsonl`
- `manifest.json`
- `DATASET_CARD.md`
- `QUALITY_REPORT.md`
- `SHA256SUMS.txt`
- stage receipts under `receipts/`

Quality tiers:

- `royal_jelly`: elite examples, 90-100
- `honey`: approved examples, 75-89
- `jelly`: questionable or repairable examples, 50-74
- `propolis`: hard rejects or unsafe examples, below 50

Edge reviewer preset:

```bash
HERMES_BASE_URL=https://your-private-agent-gateway/v1 \
HERMES_MODEL=hf.co/LiquidAI/LFM2.5-8B-A1B-GGUF:Q4_K_M \
defdata grade data/clean/input.deduped.jsonl \
  --rubric configs/domains/finance.yaml \
  --reviewer hack
```

Hack is registered as `node_hack_orin` / `worker_hack`, powered by `model_lfm2_5_8b_a1b`. The first WACC cook on edge silicon landed `JELLY` with 915 tokens, 63.9s inference time, and 17.7 steady tok/s.

Run tests:

```bash
npm run quality:test
```

## Add a Dataset

1. Add the metadata entry to `/data/registry/datasets.json`.
2. Create `datasets/[domain]/[dataset_id]/`.
3. Add `dataset.card.md`, `manifest.json`, sample rows, receipts, and split files where licensing permits.
4. Include SHA256 hashes for every file.
5. Add license compatibility expectations to `/data/registry/licenseCompatibility.json` if introducing a new license.
6. Run `npm run registry:validate`, `npm run lint`, and `npm run cf:build`.

Example package:

```text
datasets/general/minechain_master_inventory_v1/
  dataset.card.md
  manifest.json
  samples/sample.jsonl
  receipts/receipt.sha256.txt
  splits/README.md
```

## Export a Pack

Add datasets from the graph, registry, or detail page. Visit `/pack` and export:

- `pack.manifest.json`
- `hf_dataset_card.md`
- `fine_tune_manifest.json`
- `sha256_manifest.json`
- `README.md`

## Roadmap

- Real dataset file hosting
- Hugging Face sync
- S3/object storage backend
- DefendableCloud member access
- Dataset signing and Merkle proofs
- Dataset quality evaluator
- CLI validation and pack commands
- API access
- Fine-tune job handoff
- Model compatibility scoring
- Dataset lineage graph
- Dataset license compatibility checker

## Production Boundaries

- Large source files stay on NAS or object storage, referenced by receipt-backed manifests.
- The static app does not enforce bot limits by itself; the Worker download gateway owns quota enforcement.
- Clinical, legal, financial, or member-only datasets require explicit access review before file transfer.

## Community Model

Free datasets for the community. Contributors should submit metadata, proof, hashes, license clarity, and small reviewable samples first. Large data files move through NAS or object storage with gated delivery.

## Support

Tips help support the compute used to cook, hash, verify, and publish datasets.

BTC: `bc1qnfvjpvv08shp8spdfznwmftkmh8895h56kvfqj`
