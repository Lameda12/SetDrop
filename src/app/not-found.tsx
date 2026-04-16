import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold font-mono text-accent">404</h1>
      <p className="text-text-muted text-lg">Page not found.</p>
      <Link
        href="/"
        className="text-accent hover:underline text-sm mt-2"
      >
        Go home
      </Link>
    </main>
  );
}
