import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow external images from vehicle manufacturer CDNs
    remotePatterns: [
      { protocol: "https", hostname: "cdn.honda.com.vn" },
      { protocol: "https", hostname: "yamaha-motor.com.vn" },
      { protocol: "https", hostname: "www.toyota.com.vn" },
      { protocol: "https", hostname: "www.hyundai.com" },
      { protocol: "https", hostname: "mazdamotors.vn" },
      { protocol: "https", hostname: "www.kia.com" },
      { protocol: "https", hostname: "www.mitsubishi-motors.com.vn" },
      { protocol: "https", hostname: "www.ford.com.vn" },
      { protocol: "https", hostname: "www.honda.com.vn" },
      { protocol: "https", hostname: "shop.vinfast.vn" },
    ],
  },
};

export default nextConfig;
