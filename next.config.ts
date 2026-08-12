import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Car imageUrls, Supabase signed URLs, and stock placeholders are arbitrary
    // remote hosts entered by admins. Serving them as-is (bypassing the optimizer)
    // avoids remotePatterns 400s on hosts we can't enumerate ahead of time.
    unoptimized: true,
  },
};

export default nextConfig;
