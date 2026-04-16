"use client";

import { useEffect, useState } from "react";
import { fetchHypeScore } from "@/lib/hype";

interface Props {
  sessionId: string;
}

export function OverlayHypeBar({ sessionId }: Props) {
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

  if (score === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-3 overflow-hidden">
      <div
        className={`h-full transition-all duration-700 ease-out ${
          isPumping ? "animate-pulse-glow" : ""
        }`}
        style={{
          width: `${score}%`,
          background: isPumping
            ? "linear-gradient(to right, #00ff88, #00ffff)"
            : "linear-gradient(to right, #00cc66, #00ff88)",
          borderRadius: "0 4px 4px 0",
        }}
      />
    </div>
  );
}
