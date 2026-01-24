import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PLANE_INTAKE_URL = "https://projects.lunr.tech/api/v1/intake/9ec06cc8e1f749f8b13a1c87a29e191c/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, description, email } = await req.json();

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Name/title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: Record<string, string> = { name };
    if (description) payload.description = description;
    if (email) payload.email = email;

    const response = await fetch(PLANE_INTAKE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Plane API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to submit to Plane" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
