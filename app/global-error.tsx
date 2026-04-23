"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

// Root-level error boundary. Catches render errors in the root layout and
// anywhere below it when no segment-level error.tsx boundary handles them.
// Must stay a client component and live at app/ root.
export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <Error statusCode={0} />
      </body>
    </html>
  );
}
