import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Azure Static Web Apps hybrid Next.js (preview): standalone output keeps the
  // deployed app comfortably under the Free-tier 250 MB app-size cap via
  // Next.js Output File Tracing. See README > Deploy.
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
