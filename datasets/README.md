# Dataset Asset Layout

Dataset packages live beside the registry and point to real, hashed assets in git, NAS, or object storage.

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

Large split files may remain outside git. The manifest and receipt files are the source of truth for file locations, counts, sizes, and SHA256 hashes.
