export type GraphNodeType =
  | "DOMAIN"
  | "CATEGORY"
  | "DATASET"
  | "VERSION"
  | "FILE"
  | "LICENSE"
  | "FORMAT"
  | "TASK"
  | "RECEIPT";

export type GraphEdgeType =
  | "CONTAINS"
  | "BELONGS_TO"
  | "HAS_VERSION"
  | "HAS_FILE"
  | "LICENSED_AS"
  | "AVAILABLE_AS"
  | "SUPPORTS_TASK"
  | "VERIFIED_BY"
  | "DERIVED_FROM"
  | "COMPATIBLE_WITH";

export type DatasetGraphNode = {
  id: string;
  type: GraphNodeType;
  label: string;
  summary?: string;
  datasetId?: string;
  domain?: string;
  category?: string;
  status?: string;
  quality?: number;
  meta?: Record<string, unknown>;
};

export type DatasetGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  label?: string;
};

export type DatasetGraph = {
  nodes: DatasetGraphNode[];
  edges: DatasetGraphEdge[];
};

export type DatasetGraphFilters = {
  query?: string;
  domain?: string;
  format?: string;
  license?: string;
  task?: string;
  status?: string;
  minQuality?: number;
};
