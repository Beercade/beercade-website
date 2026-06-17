import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    // Keep the headless-Chromium pair out of the webpack bundle; the binary
    // ships compressed inside @sparticuz/chromium and must be loaded from
    // node_modules at runtime (used by /api/menu-pdf).
    serverComponentsExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
    // Marking the package external stops webpack bundling it, but Next's file
    // tracer never sees the 64 MB Chromium binary (it's read from disk at
    // runtime, not `require`d) so it gets left out of the serverless function.
    // Force it in, or chromium.executablePath() points at a file that isn't
    // there and the PDF route 500s on Vercel.
    //
    // Point at the real .pnpm store path, not node_modules/@sparticuz/chromium
    // (a pnpm symlink) — tracing through the symlink makes Vercel reject the
    // function as "an invalid deployment package ... files in symlinked
    // directories". The @* keeps this working across version bumps.
    outputFileTracingIncludes: {
      "/api/menu-pdf": [
        "./node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/**",
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return [
      // Old Squarespace domain → the new site. The old URL structure doesn't
      // map onto the new routes, so every old path lands on the new homepage
      // rather than 404ing. Add specific path mappings here later if analytics
      // show meaningful inbound traffic to a particular old URL.
      //
      // Requires beercadeaustralia.com.au (apex + www) to be attached to this
      // Vercel project as a domain alias so these requests reach the app.
      // WWW → apex for the live domain is handled in Vercel's domain settings.
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(www\\.)?beercadeaustralia\\.com\\.au",
          },
        ],
        destination: "https://beercade.com.au/",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "beercade",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
