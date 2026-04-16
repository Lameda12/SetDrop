import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { RequestForm } from "@/components/fan/RequestForm";
import { FanQueue } from "@/components/fan/FanQueue";
import { ReactionBar } from "@/components/fan/ReactionBar";
import type { Session, Request } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: { code: string };
}

export default async function JoinPage({ params }: Props) {
  const supabase = createClient();

  const { data: sessionRaw } = await supabase
    .from("sessions")
    .select("*")
    .eq("code", params.code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  const session = sessionRaw as Session | null;

  if (!session) notFound();

  const { data: requestsRaw } = await supabase
    .from("requests")
    .select("*")
    .eq("session_id", session.id)
    .is("played_at", null)
    .order("upvotes", { ascending: false })
    .order("created_at", { ascending: true });

  const initialRequests = (requestsRaw as Request[]) ?? [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold font-mono">
            Set<span className="text-accent">Drop</span>
          </h1>
          <span className="flex items-center gap-1.5 text-sm text-accent">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse inline-block" />
            Live
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 space-y-6">
        <div className="text-center space-y-1">
          <p className="text-text-muted text-sm uppercase tracking-wider">
            Session{" "}
            <span className="font-mono font-bold text-accent">
              {session.code}
            </span>
          </p>
          <h2 className="text-2xl font-bold">Request a Song</h2>
        </div>

        {/* Request form */}
        <RequestForm sessionId={session.id} />

        {/* Reaction bar */}
        <div className="space-y-2">
          <p className="text-xs text-center text-text-muted uppercase tracking-wider">
            Send a reaction
          </p>
          <ReactionBar sessionId={session.id} />
        </div>

        {/* Live queue */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
            Live Queue
          </h3>
          <FanQueue sessionId={session.id} initialRequests={initialRequests} />
        </div>
      </main>
    </div>
  );
}
