import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable x-powered-by header to reduce fingerprinting
  poweredByHeader: false,

  // Restrict allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Add headers for CSP and performance
  async headers() {
    const commonCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://*.vercel.app https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    return [
      // Embed & checkout pages — ALLOW framing from any origin
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [...commonCSP, "frame-ancestors *"].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // No X-Frame-Options here — allow embedding
        ],
      },
      {
        source: "/p/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [...commonCSP, "frame-ancestors *"].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      // Everything else — DENY framing
      {
        source: "/((?!embed|p/).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: commonCSP.join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
