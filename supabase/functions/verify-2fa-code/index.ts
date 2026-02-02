import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  userId: string;
  code: string;
  email?: string; // Optional fallback for lookup
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

    const { userId, code, email }: VerifyRequest = await req.json();

    console.log("Verify 2FA request received:", { userId, code: code?.substring(0, 2) + "****", email });

    if (!code || code.length !== 6) {
      console.log("Invalid code format");
      return new Response(JSON.stringify({ error: "Invalid code format", valid: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!userId && !email) {
      console.log("Missing userId and email");
      return new Response(JSON.stringify({ error: "Missing required fields", valid: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the query - try userId first, fallback to email
    let query = supabase
      .from("email_2fa_codes")
      .select("*")
      .eq("code", code)
      .eq("used", false);

    // Prefer userId if available, otherwise use email
    if (userId) {
      query = query.eq("user_id", userId);
    } else if (email) {
      query = query.eq("email", email.toLowerCase());
    }

    const { data: codeRecord, error: findError } = await query.single();

    if (findError || !codeRecord) {
      console.log("Code not found. userId:", userId, "email:", email, "error:", findError?.message);
      
      // Debug: Check if any code exists for this user
      if (userId) {
        const { data: debugData } = await supabase
          .from("email_2fa_codes")
          .select("user_id, email, code, used, expires_at")
          .eq("user_id", userId)
          .limit(5);
        console.log("Debug - codes for userId:", debugData);
      }
      
      return new Response(JSON.stringify({ error: "Invalid code", valid: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if code is expired
    if (new Date(codeRecord.expires_at) < new Date()) {
      console.log("Code expired for user:", codeRecord.user_id, "expired at:", codeRecord.expires_at);
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

    console.log("2FA code verified successfully for user:", codeRecord.user_id);

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