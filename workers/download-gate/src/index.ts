type KvBinding = {
  get<T = unknown>(key: string, type: "json"): Promise<T | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

export interface Env {
  DATASET_DOWNLOAD_QUOTA: KvBinding;
  DATASET_DOWNLOAD_LIMIT?: string;
}

const defaultLimit = 500;
const windowMs = 30 * 24 * 60 * 60 * 1000;

type QuotaRecord = {
  count: number;
  reset_at: number;
};

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const body = await request.json().catch(() => null) as { email?: string; dataset_id?: string; file_id?: string } | null;
    const email = body?.email?.trim().toLowerCase();
    const datasetId = body?.dataset_id?.trim();
    const fileId = body?.file_id?.trim();

    if (!email || !email.includes("@") || !datasetId || !fileId) {
      return json({ error: "email_dataset_id_and_file_id_required" }, 400);
    }

    const limit = Number(env.DATASET_DOWNLOAD_LIMIT ?? defaultLimit);
    const key = `quota:${email}`;
    const now = Date.now();
    const existing = await env.DATASET_DOWNLOAD_QUOTA.get<QuotaRecord>(key, "json");
    const record = existing && existing.reset_at > now ? existing : { count: 0, reset_at: now + windowMs };

    if (record.count >= limit) {
      return json({
        error: "download_quota_exceeded",
        limit,
        reset_at: new Date(record.reset_at).toISOString(),
      }, 429);
    }

    record.count += 1;
    await env.DATASET_DOWNLOAD_QUOTA.put(key, JSON.stringify(record), {
      expirationTtl: Math.ceil((record.reset_at - now) / 1000),
    });

    return json({
      ok: true,
      email,
      dataset_id: datasetId,
      file_id: fileId,
      remaining: Math.max(0, limit - record.count),
      reset_at: new Date(record.reset_at).toISOString(),
      download_url: await signDatasetUrl(datasetId, fileId),
    });
  },
};

export default worker;

async function signDatasetUrl(datasetId: string, fileId: string) {
  return `https://defendabledatasets.com/access?dataset=${encodeURIComponent(datasetId)}&file=${encodeURIComponent(fileId)}`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
