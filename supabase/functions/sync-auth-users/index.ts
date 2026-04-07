import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sourceUrl = Deno.env.get("SUPABASE_URL")!;
    const sourceServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const targetUrl = Deno.env.get("TARGET_SUPABASE_URL");
    const targetKey = Deno.env.get("TARGET_SUPABASE_SECRET_KEY");

    if (!targetUrl || !targetKey) {
      return json({ error: "Target credentials not configured" }, 500);
    }

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }
    const sourceAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(sourceUrl, sourceAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    const source = createClient(sourceUrl, sourceServiceKey);
    const target = createClient(targetUrl, targetKey);

    // LIST: get all auth users from source
    if (action === "list") {
      const allUsers = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const { data: { users }, error } = await source.auth.admin.listUsers({
          page,
          perPage,
        });
        if (error) return json({ error: error.message }, 500);
        if (!users || users.length === 0) break;
        allUsers.push(...users);
        if (users.length < perPage) break;
        page++;
      }

      return json({
        totalUsers: allUsers.length,
        users: allUsers.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          email_confirmed_at: u.email_confirmed_at,
          last_sign_in_at: u.last_sign_in_at,
          user_metadata: u.user_metadata,
        })),
      });
    }

    // SYNC: create users on target
    if (action === "sync") {
      // Step 1: Get all source users
      const allUsers = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const { data: { users }, error } = await source.auth.admin.listUsers({
          page,
          perPage,
        });
        if (error) return json({ error: error.message }, 500);
        if (!users || users.length === 0) break;
        allUsers.push(...users);
        if (users.length < perPage) break;
        page++;
      }

      // Step 2: For each user, try to create on target with a temp password
      // Note: We cannot migrate hashed passwords via the Admin API.
      // Users will need to use "Reset Password" on the target.
      const results = [];
      const tempPassword = body.temp_password || "TempMigration2025!";

      for (const u of allUsers) {
        try {
          const { data, error } = await target.auth.admin.createUser({
            email: u.email!,
            password: tempPassword,
            email_confirm: true, // auto-confirm since they were confirmed on source
            user_metadata: u.user_metadata || {},
          });

          if (error) {
            // User might already exist
            results.push({ email: u.email, status: "error", message: error.message });
          } else {
            results.push({ email: u.email, status: "created", targetId: data.user.id });
          }
        } catch (e) {
          results.push({
            email: u.email,
            status: "error",
            message: e instanceof Error ? e.message : "unknown",
          });
        }
      }

      return json({
        totalUsers: allUsers.length,
        results,
        note: "Users created with temporary password. They should use 'Reset Password' to set their own.",
      });
    }

    return json({ error: "Unknown action. Use: list, sync" }, 400);
  } catch (error) {
    console.error("Auth sync error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
