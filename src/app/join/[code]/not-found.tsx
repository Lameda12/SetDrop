import Link from "next/link";

export default function JoinNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <p className="text-5xl font-bold font-mono text-accent">404</p>
      <h1 className="text-xl font-semibold">Session not found</h1>
      <p className="text-text-muted text-center max-w-sm">
        This session code is invalid or the session has ended. Check the code
        and try again.
      </p>
      <Link href="/" className="text-accent hover:underline text-sm mt-2">
        Go home
      </Link>
    </main>
  );
}
