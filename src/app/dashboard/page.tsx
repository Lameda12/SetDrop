import { createClient } from "@/lib/supabase/server";
import { SessionControls } from "@/components/dashboard/SessionControls";
import { QueueList } from "@/components/dashboard/QueueList";
import { HypeMeter } from "@/components/dashboard/HypeMeter";
import { CopyLink } from "@/components/dashboard/CopyLink";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import type { Session, Request } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Fetch the artist's most recent active session
  const { data: activeSessionRaw } = await supabase
    .from("sessions")
    .select("*")
    .eq("artist_id", session!.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const activeSession = activeSessionRaw as Session | null;

  // Fetch initial queue if session exists
  let initialRequests: Request[] = [];
  if (activeSession) {
    const { data } = await supabase
      .from("requests")
      .select("*")
      .eq("session_id", activeSession.id)
      .is("played_at", null)
      .order("upvotes", { ascending: false })
      .order("created_at", { ascending: true });
    initialRequests = (data as Request[]) ?? [];
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold font-mono">
            Set<span className="text-accent">Drop</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted hidden sm:block">
              {session!.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Session controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Your Session</h2>
            <p className="text-text-muted text-sm mt-1">
              {activeSession
                ? "Session is live. Fans can join below."
                : "Start a session to accept song requests."}
            </p>
          </div>
          <SessionControls activeSession={activeSession} />
        </div>

        {/* Active session info */}
        {activeSession && (
          <>
            {/* Session code + join link */}
            <div className="bg-surface border border-white/10 rounded p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  Session Code
                </p>
                <p className="font-mono text-3xl font-bold text-accent tracking-widest">
                  {activeSession.code}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Share this code or the link below with your audience
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <CopyLink code={activeSession.code} />
                <a
                  href={`/join/${activeSession.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-center text-text-muted hover:text-white underline"
                >
                  Open fan page ↗
                </a>
              </div>
            </div>

            {/* Hype meter */}
            <HypeMeter sessionId={activeSession.id} />

            {/* Queue */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
                Request Queue
              </h3>
              <QueueList
                sessionId={activeSession.id}
                initialRequests={initialRequests}
              />
            </div>
          </>
        )}

        {/* No active session state */}
        {!activeSession && (
          <div className="text-center py-20 space-y-3 border border-dashed border-white/10 rounded">
            <p className="text-4xl">🎧</p>
            <p className="text-text-muted">
              Hit <strong className="text-white">Start Session</strong> to go
              live and receive song requests.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
