import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// PATCH /api/requests/[id]/played — artist marks a request as played
export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch request and verify the artist owns the session
  const { data: req } = await admin
    .from("requests")
    .select("id, session_id, sessions(artist_id)")
    .eq("id", params.id)
    .single();

  if (!req) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const sessions = req.sessions as { artist_id: string } | null;
  if (!sessions || sessions.artist_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await admin
    .from("requests")
    .update({ played_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
