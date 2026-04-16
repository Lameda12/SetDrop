import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold font-mono">
            Set<span className="text-accent">Drop</span>
          </h1>
          <p className="text-text-muted text-sm">
            Create your artist account
          </p>
        </div>
        <div className="bg-surface border border-white/10 rounded p-6">
          <SignupForm />
        </div>
        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
