// "use client";

// import * as Sentry from "@sentry/nextjs";
// import NextError from "next/error";
// import { useEffect } from "react";

// // Root-level error boundary. Catches errors in the root layout and render
// // errors anywhere below it (when segment-level error.tsx boundaries don't).
// // Reports to Sentry so on-call sees them, then falls back to Next's default
// // error page. Must stay a client component and live at the app/ root.
// export default function GlobalError({
//   error,
// }: {
//   error: Error & { digest?: string };
// }) {
//   useEffect(() => {
//     Sentry.captureException(error);
//   }, [error]);

//   return (
//     <html>
//       <body>
//         <NextError statusCode={0} />
//       </body>
//     </html>
//   );
// }

"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

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