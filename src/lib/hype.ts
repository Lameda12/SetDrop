import { createClient } from "@/lib/supabase/client";

export async function fetchHypeScore(sessionId: string): Promise<number> {
  const supabase = createClient();
  const cutoff = new Date(Date.now() - 60_000).toISOString();

  // Fetch request + reaction counts in parallel
  const [requestsResult, reactionsResult] = await Promise.all([
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .gte("created_at", cutoff),
    supabase
      .from("reactions")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .gte("created_at", cutoff),
  ]);

  // Get IDs of recent requests for vote counting
  const { data: recentRequestsRaw } = await supabase
    .from("requests")
    .select("id")
    .eq("session_id", sessionId)
    .gte("created_at", cutoff);

  // Cast to get proper type
  const recentRequests = recentRequestsRaw as { id: string }[] | null;

  let voteCount = 0;
  if (recentRequests && recentRequests.length > 0) {
    const requestIds = recentRequests.map((r) => r.id);
    const { count } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .in("request_id", requestIds)
      .gte("created_at", cutoff);
    voteCount = count ?? 0;
  }

  const reqCount = requestsResult.count ?? 0;
  const reactionCount = reactionsResult.count ?? 0;

  const raw = reqCount * 2 + voteCount * 1 + reactionCount * 0.5;
  return Math.min(100, Math.round(raw));
}
