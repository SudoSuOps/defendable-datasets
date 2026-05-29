"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dataset } from "@/lib/schema/dataset";

const storageKey = "defendable-datasets-pack-v1";

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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) setDatasets(JSON.parse(stored) as Dataset[]);
      } catch {
        setDatasets([]);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(datasets));
  }, [datasets, hydrated]);

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
