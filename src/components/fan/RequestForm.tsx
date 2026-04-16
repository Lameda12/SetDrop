"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getFingerprint } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  sessionId: string;
}

export function RequestForm({ sessionId }: Props) {
  const [songTitle, setSongTitle] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!songTitle.trim()) return;
    setLoading(true);

    const fingerprint = getFingerprint();

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        song_title: songTitle.trim(),
        requester_name: requesterName.trim() || "Anonymous",
        fingerprint,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      toast.error("You've hit the 3-request limit for this session");
    } else if (!res.ok) {
      toast.error(data.error ?? "Failed to submit request");
    } else {
      toast.success("Request submitted! 🎵");
      setSongTitle("");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-white/10 rounded p-5 space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="song">Song request</Label>
        <Input
          id="song"
          placeholder="Artist — Song name"
          maxLength={140}
          required
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          className="font-mono"
        />
        <p className="text-xs text-text-muted text-right">
          {songTitle.length}/140
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Your name (optional)</Label>
        <Input
          id="name"
          placeholder="Anonymous"
          value={requesterName}
          onChange={(e) => setRequesterName(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !songTitle.trim()}
        className="w-full"
      >
        {loading ? "Submitting…" : "Request Song"}
      </Button>
    </form>
  );
}
