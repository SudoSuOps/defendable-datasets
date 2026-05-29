export type DatasetStatus = "draft" | "verified" | "deprecated" | "archived";
export type DatasetAccess = "public" | "members" | "private";
export type DatasetSplit = "train" | "validation" | "test" | "full";
export type ReceiptType = "sha256" | "merkle" | "validation" | "license" | "provenance";

export type DatasetFile = {
  id: string;
  path: string;
  format: string;
  size_bytes: number;
  sha256: string;
  record_count: number;
  split: DatasetSplit;
  downloadable: boolean;
};

export type DatasetReceipt = {
  id: string;
  dataset_id: string;
  type: ReceiptType;
  created_at: string;
  summary: string;
  hash: string;
  path: string;
};

export type Dataset = {
  id: string;
  title: string;
  slug: string;
  description: string;
  domain: string;
  category: string;
  version: string;
  status: DatasetStatus;
  access: DatasetAccess;
  license: string;
  formats: string[];
  tasks: string[];
  record_count: number;
  size_bytes: number;
  language: string[];
  created_at: string;
  updated_at: string;
  source_type: string;
  provenance_summary: string;
  intended_use: string;
  not_intended_use: string;
  quality_score: number;
  validation: {
    status: "passed" | "pending" | "failed";
    summary: string;
  };
  files: DatasetFile[];
  external_locations?: {
    label: string;
    uri: string;
    mounted_path?: string;
    size_bytes?: number;
    sha256?: string;
    notes?: string;
  }[];
  hashes: string[];
  receipts: string[];
  tags: string[];
  compatible_models: string[];
  example_records: Record<string, unknown>[];
  citation: string;
  links: { label: string; url: string }[];
};

export type Domain = { id: string; name: string; description: string };
export type Category = { id: string; domain_id: string; name: string };
export type LicenseDefinition = {
  id: string;
  name: string;
  url: string;
  commercial_use: boolean;
};
export type FormatDefinition = { id: string; name: string; extension: string };
export type TaskDefinition = { id: string; name: string };
