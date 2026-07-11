import type { MetadataRoute } from "next";
import { providerSlugs } from "@/data/providers";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/compare", "/cache-economics", "/rate-limits", "/changelog"];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  for (const slug of providerSlugs) {
    routes.push({
      url: `${site.url}/providers/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return routes;
}
