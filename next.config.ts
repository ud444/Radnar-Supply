import type { NextConfig } from "next";
import path from "path";

const config: NextConfig = {
  // Pin file tracing to this project. A stray lockfile above the repo makes
  // Next infer the parent directory as the workspace root and trace the whole
  // tree, which bloats the serverless bundle and cripples build times.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default config;
