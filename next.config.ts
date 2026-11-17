import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (see Dockerfile).
  output: "standalone",
  experimental: {
    agentFeedback: true,
    // Speaking recordings are uploaded through a Server Action (default limit is 1 MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
  // Writing moved under Giám khảo AI; keep old links and bookmarks working.
  async redirects() {
    return [
      { source: "/writing", destination: "/examiner", permanent: true },
      { source: "/writing/submissions/:id", destination: "/examiner/writing/analysis/:id", permanent: true },
      { source: "/writing/:promptId", destination: "/examiner/writing/:promptId", permanent: true },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
