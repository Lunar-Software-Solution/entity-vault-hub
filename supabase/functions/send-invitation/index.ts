import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: string;
  invitedBy: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, role, invitedBy, token: inviteToken }: InvitationRequest = await req.json();

    if (!email || !role || !inviteToken) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      console.error("BREVO_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get inviter's name
    const { data: inviterProfile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", invitedBy)
      .single();

    const inviterName = inviterProfile?.full_name || "A team member";
    
    // Build the invitation link
    const appUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "";
    const inviteLink = `https://entity-vault-hub.lovable.app/auth?invite=${inviteToken}`;

    // Send email via Brevo
    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Entity Vault Hub",
          email: "noreply@braxtech.com",
        },
        to: [{ email }],
        subject: `You've been invited to join Entity Vault Hub`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${inviterName}</strong> has invited you to join <strong>Entity Vault Hub</strong> as a <strong>${role}</strong>.
              </p>
              <p style="font-size: 14px; color: #666; margin-bottom: 25px;">
                Entity Vault Hub helps you manage your business entities, documents, filings, and more in one centralized platform.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Brevo API error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: errorData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
