"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Request } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  request: Request;
}

export function QueueItem({ request }: Props) {
  const [marking, setMarking] = useState(false);
  const [markedOut, setMarkedOut] = useState(false);

  async function markPlayed() {
    setMarking(true);
    const res = await fetch(`/api/requests/${request.id}/played`, {
      method: "PATCH",
    });
    if (!res.ok) {
      toast.error("Failed to mark as played");
      setMarking(false);
      return;
    }
    toast.success(`"${request.song_title}" marked as played`);
    setMarkedOut(true);
  }

  if (markedOut) return null;

  return (
    <div
      className={`flex items-center justify-between rounded bg-surface border border-white/10 px-4 py-3 hover:shadow-accent-glow hover:border-white/20 transition-all group ${
        marking ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-mono font-medium text-white truncate">
          {request.song_title}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          by {request.requester_name} ·{" "}
          {formatRelativeTime(request.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-3 ml-3 shrink-0">
        <span className="font-mono text-accent text-sm font-semibold">
          {request.upvotes}▲
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={markPlayed}
          disabled={marking}
          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {marking ? "…" : "Played ✓"}
        </Button>
      </div>
    </div>
  );
}
