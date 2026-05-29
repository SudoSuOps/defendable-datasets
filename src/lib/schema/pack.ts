import type { Dataset, DatasetFile } from "./dataset";

export type PackManifest = {
  pack_id: string;
  name: string;
  description: string;
  created_at: string;
  datasets: Dataset[];
  total_record_count: number;
  total_size_bytes: number;
  licenses: string[];
  formats: string[];
  tasks: string[];
  warnings: string[];
  files: DatasetFile[];
  hashes: string[];
  recommended_use: string;
  fine_tune_notes: string[];
};
