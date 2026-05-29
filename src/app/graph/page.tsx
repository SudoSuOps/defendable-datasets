"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { DatasetGraphClient } from "@/components/DatasetGraphClient";

export default function GraphPage() {
  return (
    <ReactFlowProvider>
      <DatasetGraphClient />
    </ReactFlowProvider>
  );
}
