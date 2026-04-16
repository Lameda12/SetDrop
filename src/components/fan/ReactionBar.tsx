"use client";

import { useState } from "react";
import type { ReactionType } from "@/lib/types";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "heart", emoji: "❤️", label: "Heart" },
  { type: "music", emoji: "🎵", label: "Music" },
];

interface Props {
  sessionId: string;
}

export function ReactionBar({ sessionId }: Props) {
  const [cooldowns, setCooldowns] = useState<Set<ReactionType>>(new Set());

  async function sendReaction(type: ReactionType) {
    if (cooldowns.has(type)) return;

    setCooldowns((prev) => new Set(prev).add(type));
    setTimeout(() => {
      setCooldowns((prev) => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });
    }, 1500);

    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, type }),
    });
  }

  return (
    <div className="flex justify-center gap-6">
      {REACTIONS.map(({ type, emoji, label }) => {
        const onCooldown = cooldowns.has(type);
        return (
          <button
            key={type}
            onClick={() => sendReaction(type)}
            disabled={onCooldown}
            aria-label={label}
            className={`text-4xl transition-all duration-150 select-none ${
              onCooldown
                ? "scale-125 opacity-60 cursor-not-allowed"
                : "hover:scale-125 active:scale-95 cursor-pointer"
            }`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
