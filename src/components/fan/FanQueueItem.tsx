"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Request } from "@/lib/types";
import { getFingerprint, getVotedRequests, markRequestVoted, formatRelativeTime } from "@/lib/utils";

interface Props {
  request: Request;
}

export function FanQueueItem({ request }: Props) {
  const [upvotes, setUpvotes] = useState(request.upvotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const voted = getVotedRequests();
    setHasVoted(voted.includes(request.id));
  }, [request.id]);

  // Sync upvotes when the request prop changes from Realtime
  useEffect(() => {
    setUpvotes(request.upvotes);
  }, [request.upvotes]);

  async function handleUpvote() {
    if (hasVoted || voting) return;
    setVoting(true);

    const fingerprint = getFingerprint();
    const res = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: request.id, fingerprint }),
    });

    if (res.status === 409) {
      toast.error("You already voted for this song");
      setHasVoted(true);
      markRequestVoted(request.id);
    } else if (!res.ok) {
      toast.error("Vote failed");
    } else {
      setUpvotes((v) => v + 1);
      setHasVoted(true);
      markRequestVoted(request.id);
      toast.success("Vote counted! 🎵");
    }
    setVoting(false);
  }

  return (
    <div className="flex items-center justify-between rounded bg-surface border border-white/10 px-4 py-3 hover:border-white/20 transition-all">
      <div className="min-w-0 flex-1">
        <p className="font-mono font-medium text-white truncate">
          {request.song_title}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          by {request.requester_name} · {formatRelativeTime(request.created_at)}
        </p>
      </div>
      <button
        onClick={handleUpvote}
        disabled={hasVoted || voting}
        className={`ml-3 flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-mono font-semibold transition-all shrink-0 ${
          hasVoted
            ? "text-accent bg-accent/10 border border-accent/30 cursor-default"
            : "text-text-muted border border-white/10 hover:border-accent/50 hover:text-accent active:scale-95"
        } ${voting ? "opacity-50" : ""}`}
        title={hasVoted ? "Already voted" : "Upvote this song"}
      >
        <span>{hasVoted ? "▲" : "△"}</span>
        <span>{upvotes}</span>
      </button>
    </div>
  );
}
