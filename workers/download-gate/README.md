# DefendableDatasets Download Gate

Cloudflare Pages serves the public app. Real dataset files should be served through a Worker in front of object storage.

Policy:

- 500 successful file downloads per email per rolling 30-day window.
- Require a verified email or DefendableCloud member identity before issuing file URLs.
- Use Cloudflare Turnstile and IP throttles before quota checks.
- Store counters in Cloudflare KV or D1.
- Return signed, short-lived object-storage URLs only after quota is incremented.

This worker is a deployable enforcement scaffold. Wire `DATASET_DOWNLOAD_QUOTA` to KV and replace `signDatasetUrl` with the storage backend signer.

