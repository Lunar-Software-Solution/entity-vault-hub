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
    const { userId, deviceToken } = await req.json();

    if (!userId || !deviceToken) {
      return new Response(
        JSON.stringify({ trusted: false, error: "Missing userId or deviceToken" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if device token exists and is not expired
    const { data: device, error } = await supabaseAdmin
      .from("trusted_devices")
      .select("id, expires_at")
      .eq("user_id", userId)
      .eq("device_token", deviceToken)
      .single();

    if (error || !device) {
      return new Response(
        JSON.stringify({ trusted: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(device.expires_at) < new Date()) {
      // Delete expired device
      await supabaseAdmin
        .from("trusted_devices")
        .delete()
        .eq("id", device.id);

      return new Response(
        JSON.stringify({ trusted: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last_used_at
    await supabaseAdmin
      .from("trusted_devices")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", device.id);

    return new Response(
      JSON.stringify({ trusted: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Error checking trusted device:", err);
    return new Response(
      JSON.stringify({ trusted: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
