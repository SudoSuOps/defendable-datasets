"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Dataset } from "@/lib/schema/dataset";

type PackContextValue = {
  datasets: Dataset[];
  ids: Set<string>;
  addDataset: (dataset: Dataset) => void;
  removeDataset: (id: string) => void;
  clearPack: () => void;
};

const PackContext = createContext<PackContextValue | null>(null);

export function PackProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const value = useMemo<PackContextValue>(
    () => ({
      datasets,
      ids: new Set(datasets.map((dataset) => dataset.id)),
      addDataset: (dataset) =>
        setDatasets((current) =>
          current.some((item) => item.id === dataset.id) ? current : [...current, dataset],
        ),
      removeDataset: (id) => setDatasets((current) => current.filter((dataset) => dataset.id !== id)),
      clearPack: () => setDatasets([]),
    }),
    [datasets],
  );

  return <PackContext.Provider value={value}>{children}</PackContext.Provider>;
}

export function usePack() {
  const context = useContext(PackContext);
  if (!context) throw new Error("usePack must be used inside PackProvider");
  return context;
}
