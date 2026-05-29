"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
