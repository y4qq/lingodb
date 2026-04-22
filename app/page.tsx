import { redirect } from "next/navigation";

// The proxy redirects `/` based on auth state (→ /courses when signed in,
// → /login otherwise), so this page is only reached as a fallback.
export default function Home() {
  redirect("/login");
}
