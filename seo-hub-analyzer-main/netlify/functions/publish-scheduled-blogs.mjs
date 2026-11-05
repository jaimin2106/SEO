import { createClient } from "@supabase/supabase-js";

export const config = { schedule: "*/5 * * * *" };

export const handler = async () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[scheduled-blogs] Supabase server environment is not configured.");
    return { statusCode: 500, body: "Scheduled publishing is not configured." };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const now = new Date().toISOString();
  const { data: duePosts, error: queryError } = await supabase
    .from("blogs")
    .select("id, scheduled_at")
    .eq("status", "scheduled")
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(100);

  if (queryError) {
    console.error("[scheduled-blogs] Could not query due posts:", queryError.message);
    return { statusCode: 500, body: "Could not query scheduled posts." };
  }

  let publishedCount = 0;
  for (const post of duePosts ?? []) {
    const { data, error } = await supabase
      .from("blogs")
      .update({ status: "published", published_at: post.scheduled_at })
      .eq("id", post.id)
      .eq("status", "scheduled")
      .eq("scheduled_at", post.scheduled_at)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[scheduled-blogs] Could not publish a scheduled post:", error.message);
      return { statusCode: 500, body: "A scheduled post could not be published." };
    }
    if (data) publishedCount += 1;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ published: publishedCount }),
  };
};