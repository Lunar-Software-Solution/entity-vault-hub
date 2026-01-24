import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, linkedin_url, name } = await req.json();

    if (!email && !linkedin_url) {
      return new Response(
        JSON.stringify({ error: "Either email or linkedin_url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const CLAY_API_KEY = Deno.env.get("CLAY_API_KEY");
    if (!CLAY_API_KEY) {
      console.error("CLAY_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Clay API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clay People Enrichment API endpoint
    // Note: This requires Clay Enterprise access
    const clayEndpoint = "https://api.clay.com/v1/people/enrich";
    
    const enrichmentPayload: Record<string, string> = {};
    if (email) enrichmentPayload.email = email;
    if (linkedin_url) enrichmentPayload.linkedin_url = linkedin_url;
    if (name) enrichmentPayload.name = name;

    console.log("Enriching profile with Clay:", enrichmentPayload);

    const clayResponse = await fetch(clayEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrichmentPayload),
    });

    if (!clayResponse.ok) {
      const errorText = await clayResponse.text();
      console.error("Clay API error:", clayResponse.status, errorText);
      
      // If Clay API fails, return a fallback response with available data
      return new Response(
        JSON.stringify({
          success: false,
          fallback: true,
          message: "Clay enrichment unavailable, using fallback",
          data: {
            name: name || null,
            email: email || null,
            linkedin_url: linkedin_url || null,
            avatar_url: null,
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clayData = await clayResponse.json();
    console.log("Clay enrichment result:", clayData);

    // Extract relevant profile data from Clay response
    const enrichedProfile = {
      success: true,
      fallback: false,
      data: {
        name: clayData.full_name || clayData.name || name || null,
        email: clayData.email || email || null,
        linkedin_url: clayData.linkedin_url || linkedin_url || null,
        avatar_url: clayData.photo_url || clayData.profile_image || clayData.avatar_url || null,
        title: clayData.title || clayData.job_title || null,
        company: clayData.company || clayData.organization || null,
        location: clayData.location || null,
        bio: clayData.bio || clayData.summary || null,
      }
    };

    return new Response(
      JSON.stringify(enrichedProfile),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in enrich-profile function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
