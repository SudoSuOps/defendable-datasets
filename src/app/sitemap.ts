import type { MetadataRoute } from "next";
import { datasets } from "@/lib/registry/data";

const baseUrl = "https://defendabledatasets.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/graph", "/app/graph", "/registry", "/pack", "/contribute", "/docs"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-05-29"),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const datasetRoutes = datasets.flatMap((dataset) => [
    {
      url: `${baseUrl}/datasets/${dataset.id}`,
      lastModified: new Date(dataset.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/datasets/${dataset.slug}`,
      lastModified: new Date(dataset.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ]);

  return [...staticRoutes, ...datasetRoutes];
}
