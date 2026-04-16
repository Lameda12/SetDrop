import { EmojiLayer } from "@/components/overlay/EmojiLayer";
import { OverlayHypeBar } from "@/components/overlay/OverlayHypeBar";

interface Props {
  params: { sessionId: string };
}

export default function OverlayPage({ params }: Props) {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ background: "transparent" }}
    >
      <EmojiLayer sessionId={params.sessionId} />
      <OverlayHypeBar sessionId={params.sessionId} />
    </div>
  );
}
