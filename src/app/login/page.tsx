import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold font-mono">
            Set<span className="text-accent">Drop</span>
          </h1>
          <p className="text-text-muted text-sm">
            Log in to your artist account
          </p>
        </div>
        <div className="bg-surface border border-white/10 rounded p-6">
          <LoginForm />
        </div>
        <p className="text-center text-sm text-text-muted">
          No account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
