# Dataset Asset Layout

Dataset packages live beside the registry so the project can evolve from metadata-only entries to real, hashed assets.

```text
datasets/
  [domain]/
    [dataset_id]/
      dataset.card.md
      manifest.json
      samples/
      receipts/
      splits/
```

The current packages are demo scaffolds unless a split file contains real data and a matching SHA256 receipt.
