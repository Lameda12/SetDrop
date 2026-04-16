"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Request } from "@/lib/types";
import { QueueItem } from "./QueueItem";
import { toast } from "sonner";

interface Props {
  sessionId: string;
  initialRequests: Request[];
}

function sortRequests(reqs: Request[]): Request[] {
  return [...reqs].sort(
    (a, b) =>
      b.upvotes - a.upvotes ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export function QueueList({ sessionId, initialRequests }: Props) {
  const [requests, setRequests] = useState<Request[]>(
    sortRequests(initialRequests)
  );
  const prevCountRef = useRef(initialRequests.length);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`dashboard-queue-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requests",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newReq = payload.new as Request;
            setRequests((prev) => {
              if (prev.some((r) => r.id === newReq.id)) return prev;
              const updated = sortRequests([newReq, ...prev]);
              if (updated.length > prevCountRef.current) {
                toast.info(`🎵 New request: "${newReq.song_title}"`);
              }
              prevCountRef.current = updated.length;
              return updated;
            });
          }

          if (payload.eventType === "UPDATE") {
            const updatedReq = payload.new as Request;
            setRequests((prev) => {
              if (updatedReq.played_at) {
                // Remove played items
                return prev.filter((r) => r.id !== updatedReq.id);
              }
              return sortRequests(
                prev.map((r) => (r.id === updatedReq.id ? updatedReq : r))
              );
            });
          }

          if (payload.eventType === "DELETE") {
            setRequests((prev) =>
              prev.filter((r) => r.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-4xl">🎤</p>
        <p className="text-text-muted">
          No requests yet. Share your session code with the crowd!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((r) => (
        <QueueItem key={r.id} request={r} />
      ))}
    </div>
  );
}
