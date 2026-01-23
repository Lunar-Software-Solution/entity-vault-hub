import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  userId: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { userId, code }: VerifyRequest = await req.json();

    if (!userId || !code) {
      return new Response(JSON.stringify({ error: "Missing required fields", valid: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the code
    const { data: codeRecord, error: findError } = await supabase
      .from("email_2fa_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .eq("used", false)
      .single();

    if (findError || !codeRecord) {
      console.log("Code not found for user:", userId);
      return new Response(JSON.stringify({ error: "Invalid code", valid: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if code is expired
    if (new Date(codeRecord.expires_at) < new Date()) {
      console.log("Code expired for user:", userId);
      return new Response(JSON.stringify({ error: "Code expired", valid: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete the code after successful verification (one-time use)
    await supabase
      .from("email_2fa_codes")
      .delete()
      .eq("id", codeRecord.id);

    console.log("2FA code verified successfully for user:", userId);

    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in verify-2fa-code function:", error);
    return new Response(JSON.stringify({ error: error.message, valid: false }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);