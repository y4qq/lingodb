import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "webtectonic",

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
  // side errors will fail. See /monitoring in lib/supabase/proxy.ts PUBLIC_PATH_PREFIXES.
  tunnelRoute: "/monitoring",

  // NOTE: the wizard also wrote a `webpack: { ... }` block here. Removed
  // because this project builds with Turbopack (Next.js 16); the webpack-
  // only options were silently ignored. Re-add `automaticVercelMonitors`
  // and `treeshake` here if this project ever switches back to webpack.
});
