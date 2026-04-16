"use client";

import { useEffect, useState } from "react";
import { fetchHypeScore } from "@/lib/hype";

interface Props {
  sessionId: string;
}

export function HypeMeter({ sessionId }: Props) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function poll() {
      const s = await fetchHypeScore(sessionId);
      setScore(s);
    }
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const isPumping = score > 70;

  return (
    <div className="bg-surface border border-white/10 rounded p-4 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted uppercase tracking-wider font-medium">
          Hype Meter
        </span>
        <span
          className={`font-mono font-semibold ${
            isPumping ? "text-accent" : "text-text-muted"
          }`}
        >
          {score}
          <span className="text-text-muted font-normal">/100</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-background border border-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isPumping ? "animate-pulse-glow" : ""
          }`}
          style={{
            width: `${score}%`,
            background:
              score > 70
                ? "linear-gradient(to right, #00ff88, #00ffcc)"
                : "linear-gradient(to right, #00cc66, #00ff88)",
          }}
        />
      </div>
      {isPumping && (
        <p className="text-xs text-accent text-center animate-pulse">
          🔥 The crowd is hyped!
        </p>
      )}
    </div>
  );
}
