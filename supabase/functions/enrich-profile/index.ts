import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract LinkedIn username from URL
function extractLinkedInUsername(url: string): string | null {
  if (!url) return null;
  const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/i);
  return match ? match[1] : null;
}

// Fetch profile data from Coresignal Clean Employee API
async function fetchCoresignalProfile(linkedinUrl: string): Promise<{
  avatar_url: string | null;
  name: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
} | null> {
  const CORESIGNAL_API_KEY = Deno.env.get("CORESIGNAL_API_KEY");
  if (!CORESIGNAL_API_KEY) {
    console.log("CORESIGNAL_API_KEY not configured");
    return null;
  }

  const username = extractLinkedInUsername(linkedinUrl);
  if (!username) {
    console.log("Could not extract LinkedIn username from:", linkedinUrl);
    return null;
  }

  try {
    console.log("Fetching Coresignal profile for:", username);
    
    const response = await fetch(
      `https://api.coresignal.com/cdapi/v2/employee_clean/collect/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
          "apikey": CORESIGNAL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Coresignal API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("Coresignal response preview:", JSON.stringify(data).slice(0, 500));
    console.log("Coresignal picture_url:", data.picture_url || "NOT FOUND");

    // Extract the most recent experience for title/company
    const experiences = data.member_experience_collection || [];
    const currentJob = experiences.find((exp: any) => !exp.date_to) || experiences[0];

    return {
      avatar_url: data.picture_url || null,
      name: data.full_name || null,
      title: currentJob?.title || data.title || null,
      company: currentJob?.company_name || data.company || null,
      location: data.location || null,
      bio: data.summary || null,
    };
  } catch (error) {
    console.error("Coresignal fetch error:", error);
    return null;
  }
}

// Try to fetch avatar from unavatar.io using LinkedIn username (fallback)
async function getUnavatarUrl(linkedinUrl: string): Promise<string | null> {
  const username = extractLinkedInUsername(linkedinUrl);
  if (!username) return null;
  
  const avatarUrl = `https://unavatar.io/linkedin/${username}?fallback=false`;
  
  try {
    const response = await fetch(avatarUrl, { method: "GET", redirect: "follow" });
    
    if (!response.ok) {
      console.log("Unavatar returned non-OK status:", response.status);
      return null;
    }
    
    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      console.log("Unavatar returned non-image content type:", contentType);
      return null;
    }
    
    const isFallback = response.headers.get("x-fallback");
    if (isFallback === "true") {
      console.log("Unavatar returned fallback avatar");
      return null;
    }
    
    console.log("Unavatar found valid avatar for:", username);
    return `https://unavatar.io/linkedin/${username}`;
  } catch (error) {
    console.log("Unavatar check failed:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !data?.claims) {
      console.error("Auth error:", authError);
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

    // PRIORITY 1: Try Coresignal for LinkedIn profiles (most reliable for avatars)
    let coresignalData = null;
    if (linkedin_url) {
      coresignalData = await fetchCoresignalProfile(linkedin_url);
      if (coresignalData) {
        console.log("Coresignal enrichment successful:", coresignalData.name);
      }
    }

    // Check if Coresignal has complete data (avatar + bio)
    // If bio is missing, continue to AI enrichment to fill gaps
    if (coresignalData && coresignalData.avatar_url && coresignalData.bio) {
      const result = {
        success: true,
        fallback: false,
        source: "coresignal",
        data: {
          name: coresignalData.name || name || null,
          email: email || null,
          linkedin_url: linkedin_url || null,
          avatar_url: coresignalData.avatar_url,
          title: coresignalData.title || null,
          company: coresignalData.company || null,
          location: coresignalData.location || null,
          bio: coresignalData.bio || null,
        }
      };
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Coresignal data incomplete, continuing to AI enrichment for missing fields");

    // PRIORITY 2: Try Lovable AI for additional enrichment
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.log("LOVABLE_API_KEY not configured, trying fallbacks");
      
      // Try unavatar as last resort for avatar
      let avatarUrl = null;
      if (linkedin_url) {
        avatarUrl = await getUnavatarUrl(linkedin_url);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          fallback: true,
          message: "AI enrichment not configured",
          data: { 
            name: coresignalData?.name || name || null, 
            email: email || null, 
            linkedin_url: linkedin_url || null, 
            avatar_url: avatarUrl,
            title: coresignalData?.title || null,
            company: coresignalData?.company || null,
            location: coresignalData?.location || null,
            bio: coresignalData?.bio || null,
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build search context for AI
    const searchContext = [];
    if (name || coresignalData?.name) searchContext.push(`Name: ${coresignalData?.name || name}`);
    if (email) searchContext.push(`Email: ${email}`);
    if (linkedin_url) searchContext.push(`LinkedIn: ${linkedin_url}`);
    if (coresignalData?.title) searchContext.push(`Title: ${coresignalData.title}`);
    if (coresignalData?.company) searchContext.push(`Company: ${coresignalData.company}`);

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
        messages: [{ role: "user", content: prompt }],
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
      
      // Fallback to unavatar
      let avatarUrl = null;
      if (linkedin_url) {
        avatarUrl = await getUnavatarUrl(linkedin_url);
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          fallback: true,
          message: "AI enrichment unavailable",
          data: { 
            name: coresignalData?.name || name || null, 
            email: email || null, 
            linkedin_url: linkedin_url || null, 
            avatar_url: avatarUrl,
            title: coresignalData?.title || null,
            company: coresignalData?.company || null,
            location: coresignalData?.location || null,
            bio: coresignalData?.bio || null,
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", content);

    let enrichedData;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1]?.trim() || content.trim();
      enrichedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      enrichedData = {
        name: coresignalData?.name || name || null,
        email: email || null,
        linkedin_url: linkedin_url || null,
        avatar_url: null,
        title: coresignalData?.title || null,
        company: coresignalData?.company || null,
        location: coresignalData?.location || null,
        bio: coresignalData?.bio || null,
      };
    }

    // Determine final avatar: Coresignal > AI > Unavatar
    let finalAvatarUrl = coresignalData?.avatar_url || enrichedData.avatar_url || null;
    const finalLinkedInUrl = linkedin_url || enrichedData.linkedin_url;
    
    if (!finalAvatarUrl && finalLinkedInUrl) {
      finalAvatarUrl = await getUnavatarUrl(finalLinkedInUrl);
      if (finalAvatarUrl) {
        console.log("Using unavatar.io fallback for avatar:", finalAvatarUrl);
      }
    }

    const result = {
      success: true,
      fallback: false,
      data: {
        name: coresignalData?.name || enrichedData.name || name || null,
        email: email || enrichedData.email || null,
        linkedin_url: finalLinkedInUrl || null,
        avatar_url: finalAvatarUrl,
        title: coresignalData?.title || enrichedData.title || null,
        company: coresignalData?.company || enrichedData.company || null,
        location: coresignalData?.location || enrichedData.location || null,
        bio: coresignalData?.bio || enrichedData.bio || null,
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
