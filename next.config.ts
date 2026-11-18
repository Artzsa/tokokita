import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Storefront reads cookies (cart) and the database on every request, so the
  // app is request-time by design. Cache Components would force every such read
  // behind a Suspense boundary; that trade-off is not worth it here.
  cacheComponents: false,
  images: {
    // Seeded product placeholders are local SVGs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
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
