import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/requests — fan submits a song request
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { session_id, song_title, requester_name, fingerprint } = body;

  if (!session_id || !song_title || !fingerprint) {
    return NextResponse.json(
      { error: "Missing required fields: session_id, song_title, fingerprint" },
      { status: 400 }
    );
  }

  if (typeof song_title !== "string" || song_title.length > 140) {
    return NextResponse.json(
      { error: "song_title must be a string of at most 140 characters" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify session is active
  const { data: sess } = await admin
    .from("sessions")
    .select("id, is_active")
    .eq("id", session_id)
    .single();

  if (!sess || !sess.is_active) {
    return NextResponse.json(
      { error: "Session not found or inactive" },
      { status: 404 }
    );
  }

  // Rate limit: max 3 requests per fingerprint per session
  const { count } = await admin
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session_id)
    .eq("fingerprint", fingerprint);

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Request limit reached (3 per session)" },
      { status: 429 }
    );
  }

  const { data, error } = await admin
    .from("requests")
    .insert({
      session_id,
      song_title: song_title.trim(),
      requester_name: (requester_name || "Anonymous").slice(0, 50),
      fingerprint,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
