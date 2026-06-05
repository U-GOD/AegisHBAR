import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: "https://aegishbar-production.up.railway.app"
  }
};

export default nextConfig;
