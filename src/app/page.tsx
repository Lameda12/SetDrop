import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold tracking-tight font-mono">
          Set<span className="text-accent">Drop</span>
        </h1>
        <p className="text-text-muted text-xl max-w-md">
          Live song requests and hype tools for indie artists and streamers.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded bg-accent text-background px-6 py-3 font-semibold hover:brightness-110 transition-all"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded border border-white/10 px-6 py-3 text-text-muted hover:text-white hover:border-white/20 transition-all"
        >
          Log In
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl w-full">
        {[
          {
            icon: "🎵",
            title: "Live Requests",
            desc: "Fans submit songs in real-time. Queue updates instantly.",
          },
          {
            icon: "🔥",
            title: "Hype Meter",
            desc: "Visual energy gauge that reflects crowd engagement.",
          },
          {
            icon: "🎥",
            title: "OBS Overlay",
            desc: "Transparent browser source for streaming. Plug in and go.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-surface border border-white/10 rounded p-4 space-y-2 hover:shadow-accent-glow transition-shadow"
          >
            <span className="text-2xl">{feature.icon}</span>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-text-muted">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
