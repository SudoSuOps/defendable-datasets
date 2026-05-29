"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { DatasetGraphClient } from "@/components/DatasetGraphClient";

export function GraphRouteClient() {
  return (
    <ReactFlowProvider>
      <DatasetGraphClient />
    </ReactFlowProvider>
  );
}
