export const DOWNLOADS_PER_EMAIL_LIMIT = 500;

export const accessPolicy = {
  downloads_per_email: DOWNLOADS_PER_EMAIL_LIMIT,
  window: "30 days",
  enforcement: "Cloudflare Worker + KV",
  contact: "build@defendableos.com",
};

