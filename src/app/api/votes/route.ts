import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/votes — fan upvotes a song request
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { request_id, fingerprint } = body;

  if (!request_id || !fingerprint) {
    return NextResponse.json(
      { error: "Missing required fields: request_id, fingerprint" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Insert vote — unique(request_id, fingerprint) handles dedup
  const { error: voteError } = await admin
    .from("votes")
    .insert({ request_id, fingerprint });

  if (voteError) {
    // PostgreSQL unique violation
    if (voteError.code === "23505") {
      return NextResponse.json(
        { error: "Already voted for this request" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: voteError.message }, { status: 500 });
  }

  // Atomically increment the denormalized upvote count via RPC
  const { error: rpcError } = await admin.rpc("increment_upvote", {
    request_id,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
