interface Props {
  emoji: string;
  x: number; // percentage 5–95
}

export function FloatingEmoji({ emoji, x }: Props) {
  return (
    <div
      className="absolute bottom-10 text-5xl animate-float-up select-none pointer-events-none"
      style={{ left: `${x}%`, transform: "translateX(-50%)" }}
    >
      {emoji}
    </div>
  );
}
