"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  code: string;
}

export function CopyLink({ code }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/join/${code}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={copyLink}>
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}
