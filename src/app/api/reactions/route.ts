import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const VALID_TYPES = ["fire", "heart", "music"] as const;

// POST /api/reactions — fan sends a reaction burst
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { session_id, type } = body;

  if (!session_id || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      {
        error: `Invalid fields. type must be one of: ${VALID_TYPES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("reactions")
    .insert({ session_id, type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
