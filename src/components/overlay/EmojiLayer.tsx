"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReactionType } from "@/lib/types";
import { FloatingEmoji } from "./FloatingEmoji";

interface EmojiInstance {
  id: string;
  type: ReactionType;
  x: number;
}

const EMOJI_MAP: Record<ReactionType, string> = {
  fire: "🔥",
  heart: "❤️",
  music: "🎵",
};

interface Props {
  sessionId: string;
}

export function EmojiLayer({ sessionId }: Props) {
  const [emojis, setEmojis] = useState<EmojiInstance[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`overlay-reactions-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reactions",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const reaction = payload.new as { type: ReactionType };
          const id = crypto.randomUUID();
          const x = Math.random() * 85 + 5; // 5–90%

          setEmojis((prev) => [...prev, { id, type: reaction.type, x }]);

          // Remove after animation completes (2s + small buffer)
          setTimeout(() => {
            setEmojis((prev) => prev.filter((e) => e.id !== id));
          }, 2300);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return (
    <>
      {emojis.map(({ id, type, x }) => (
        <FloatingEmoji key={id} emoji={EMOJI_MAP[type]} x={x} />
      ))}
    </>
  );
}
