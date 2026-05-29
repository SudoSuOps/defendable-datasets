"use client";

import { useMemo, useState } from "react";
import { Download, Mail } from "lucide-react";
import { DOWNLOADS_PER_EMAIL_LIMIT } from "@/lib/access/downloadPolicy";

const storageKey = "defendable-datasets-access-email";

export function AccessRequestForm() {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(storageKey) ?? "";
  });
  const [saved, setSaved] = useState(false);

  const requestHref = useMemo(() => {
    const subject = encodeURIComponent("DefendableDatasets access request");
    const body = encodeURIComponent(`Email: ${email}\nRequested limit: ${DOWNLOADS_PER_EMAIL_LIMIT} downloads per rolling window\nUse case:\nDatasets:\n`);
    return `mailto:build@defendableos.com?subject=${subject}&body=${body}`;
  }, [email]);

  const save = () => {
    window.localStorage.setItem(storageKey, email);
    setSaved(true);
  };

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-4">
      <label className="text-sm font-medium text-white" htmlFor="access-email">
        Access email
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="access-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSaved(false);
          }}
          placeholder="builder@example.com"
          className="min-h-10 flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 focus:border-amber-200/60"
        />
        <button
          type="button"
          onClick={save}
          disabled={!email.includes("@")}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Download className="size-4" />
          Save
        </button>
        <a
          href={requestHref}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
        >
          <Mail className="size-4" />
          Request access
        </a>
      </div>
      <p className="mt-3 text-sm text-slate-400">
        Production file delivery is capped at {DOWNLOADS_PER_EMAIL_LIMIT} downloads per email per rolling window. The static app stores your email locally for pack manifests; enforcement belongs at the download gateway.
      </p>
      {saved ? <p className="mt-2 text-sm text-emerald-100">Email saved locally for export attribution.</p> : null}
    </div>
  );
}

