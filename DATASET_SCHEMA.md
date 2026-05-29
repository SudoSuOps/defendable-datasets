# Dataset Schema

Dataset entries live in `/data/registry/datasets.json`.

Required fields:

- `id`
- `title`
- `slug`
- `description`
- `domain`
- `category`
- `version`
- `status`: `draft`, `verified`, `deprecated`, or `archived`
- `access`: `public`, `members`, or `private`
- `license`
- `formats`
- `tasks`
- `record_count`
- `size_bytes`
- `language`
- `created_at`
- `updated_at`
- `source_type`
- `provenance_summary`
- `intended_use`
- `not_intended_use`
- `quality_score`
- `validation`
- `files`
- `external_locations`
- `hashes`
- `receipts`
- `tags`
- `compatible_models`
- `example_records`
- `citation`
- `links`

File object:

- `id`
- `path`
- `format`
- `size_bytes`
- `sha256`
- `record_count`
- `split`: `train`, `validation`, `test`, or `full`
- `downloadable`

External location object:

- `label`
- `uri`
- `mounted_path`
- `size_bytes`
- `sha256`
- `notes`

Receipt object:

- `id`
- `dataset_id`
- `type`: `sha256`, `merkle`, `validation`, `license`, or `provenance`
- `created_at`
- `summary`
- `hash`
- `path`
