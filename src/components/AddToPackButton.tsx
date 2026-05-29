"use client";

import type { Dataset } from "@/lib/schema/dataset";
import { usePack } from "./PackProvider";

export function AddToPackButton({ dataset }: { dataset: Dataset }) {
  const { addDataset, ids } = usePack();
  const selected = ids.has(dataset.id);
  return (
    <button
      onClick={() => addDataset(dataset)}
      disabled={selected}
      className="rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
    >
      {selected ? "In pack" : "Add to pack"}
    </button>
  );
}
