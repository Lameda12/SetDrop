"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Session } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface Props {
  activeSession: Session | null;
}

export function SessionControls({ activeSession }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startSession() {
    setLoading(true);
    const res = await fetch("/api/sessions", { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not start session");
    } else {
      toast.success("Session started!");
      router.refresh();
    }
    setLoading(false);
  }

  async function endSession() {
    if (!activeSession) return;
    setLoading(true);
    const res = await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: activeSession.id, is_active: false }),
    });
    if (!res.ok) {
      toast.error("Could not end session");
    } else {
      toast.success("Session ended");
      router.refresh();
    }
    setLoading(false);
  }

  if (activeSession) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-accent">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse inline-block" />
          Live
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={endSession}
          disabled={loading}
        >
          {loading ? "Ending…" : "End Session"}
        </Button>
        <a
          href={`/overlay/${activeSession.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-text-muted hover:text-white underline transition-colors"
        >
          OBS Overlay ↗
        </a>
      </div>
    );
  }

  return (
    <Button onClick={startSession} disabled={loading} size="lg">
      {loading ? "Starting…" : "Start Session"}
    </Button>
  );
}
