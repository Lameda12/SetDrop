import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateCode } from "@/lib/utils";

// POST /api/sessions — artist creates a new session
export async function POST() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Generate a unique 6-char code (retry on collision)
  let code = "";
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateCode();
    const { data } = await admin
      .from("sessions")
      .select("id")
      .eq("code", candidate)
      .maybeSingle();
    if (!data) {
      code = candidate;
      break;
    }
  }

  if (!code) {
    return NextResponse.json(
      { error: "Could not generate unique code, try again" },
      { status: 500 }
    );
  }

  const { data, error } = await admin
    .from("sessions")
    .insert({ artist_id: session.user.id, code })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/sessions — artist toggles session is_active
export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, is_active } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify ownership
  const { data: sess } = await admin
    .from("sessions")
    .select("artist_id")
    .eq("id", sessionId)
    .single();

  if (!sess || sess.artist_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await admin
    .from("sessions")
    .update({ is_active })
    .eq("id", sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
