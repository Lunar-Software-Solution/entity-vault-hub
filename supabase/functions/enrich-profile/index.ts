import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    if (!email && !linkedin_url && !name) {
      return new Response(
        JSON.stringify({ error: "At least one of email, linkedin_url, or name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          fallback: true,
          message: "AI enrichment not configured",
          data: { name: name || null, email: email || null, linkedin_url: linkedin_url || null, avatar_url: null }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search context
    const searchContext = [];
    if (name) searchContext.push(`Name: ${name}`);
    if (email) searchContext.push(`Email: ${email}`);
    if (linkedin_url) searchContext.push(`LinkedIn: ${linkedin_url}`);

    const prompt = `You are a professional profile enrichment assistant. Given the following information about a person, provide any additional professional details you can infer or know about them.

Input:
${searchContext.join("\n")}

Respond with a JSON object containing these fields (use null for unknown values):
- name: Full name
- email: Email address
- linkedin_url: LinkedIn profile URL
- avatar_url: Profile photo URL (null if unknown)
- title: Job title or role
- company: Current company/organization
- location: City, Country
- bio: Brief professional summary (1-2 sentences max)

Important: Only include information you are confident about. For avatar_url, only include if you have a direct URL. Respond ONLY with the JSON object, no additional text.`;

    console.log("Enriching profile with Lovable AI:", { email, linkedin_url, name });

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          fallback: true,
          message: "AI enrichment unavailable",
          data: { name: name || null, email: email || null, linkedin_url: linkedin_url || null, avatar_url: null }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", content);

    // Parse the JSON response
    let enrichedData;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1]?.trim() || content.trim();
      enrichedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      enrichedData = {
        name: name || null,
        email: email || null,
        linkedin_url: linkedin_url || null,
        avatar_url: null,
        title: null,
        company: null,
        location: null,
        bio: null,
      };
    }

    // Merge with input data (input takes precedence for email/linkedin_url)
    const result = {
      success: true,
      fallback: false,
      data: {
        name: enrichedData.name || name || null,
        email: email || enrichedData.email || null,
        linkedin_url: linkedin_url || enrichedData.linkedin_url || null,
        avatar_url: enrichedData.avatar_url || null,
        title: enrichedData.title || null,
        company: enrichedData.company || null,
        location: enrichedData.location || null,
        bio: enrichedData.bio || null,
      }
    };

    return new Response(
      JSON.stringify(result),
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
