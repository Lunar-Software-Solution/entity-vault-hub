import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PLANE_API_URL = "https://projects.lunr.tech/api/v1/workspaces/brax/projects/76bc3b1f-f2db-4caf-892a-0136bd90fba0/intake-issues/";

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
    const PLANE_API_KEY = Deno.env.get("PLANE_API_KEY");
    
    if (!PLANE_API_KEY) {
      console.error("PLANE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, description, email } = await req.json();

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Name/title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build description with email if provided
    let fullDescription = description || "";
    if (email) {
      fullDescription = fullDescription ? `${fullDescription}\n\nSubmitted by: ${email}` : `Submitted by: ${email}`;
    }

    // Plane API expects issue wrapped in an "issue" object
    const payload = {
      issue: {
        name,
        description_html: `<p>${fullDescription.replace(/\n/g, "</p><p>")}</p>`,
      }
    };

    const response = await fetch(PLANE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PLANE_API_KEY,
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
