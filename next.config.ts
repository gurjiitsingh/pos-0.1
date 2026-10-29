import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  env: {
    PAYPAL_CLIENT_ID:
      "BAAQambvfgf8cMiIWoROWluTortr5X08lvESisQno-RXyWIK7Mk8JzNL7UNonzp8h5g5ZGjd8HTp2vBHD_4zk",
  },
};

export default nextConfig;