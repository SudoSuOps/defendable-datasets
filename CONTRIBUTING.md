# Contributing

DefendableDatasets is registry-first. A useful contribution is not just a file; it is a dataset asset with provenance.

## Pull Request Checklist

- Add or update `/data/registry/datasets.json`.
- Add `datasets/[domain]/[dataset_id]/dataset.card.md`.
- Add `datasets/[domain]/[dataset_id]/manifest.json`.
- Add small, safe examples under `samples/`.
- Add source, license, validation, and SHA256 receipts under `receipts/`.
- Add split files under `splits/` only when redistribution is allowed.
- Keep demo or restricted data clearly labeled.
- Run `npm run registry:validate`, `npm run lint`, and `npm run cf:build`.

## Required Proof

Every real file must have a SHA256 hash. Every real dataset must declare a license and provenance summary. Public data still needs receipts.

No proof, no honey.

## CLI

```bash
npm run registry:validate
npm run registry:hash -- <file...>
npm run registry:pack -- <dataset-id...> --out pack.manifest.json
```
