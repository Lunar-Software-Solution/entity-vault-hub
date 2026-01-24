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

    if (!linkedin_url) {
      return new Response(
        JSON.stringify({ error: "LinkedIn URL is required for enrichment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch profile from Coresignal
    const coresignalData = await fetchCoresignalProfile(linkedin_url);
    
    if (!coresignalData) {
      // Try unavatar as fallback for avatar only
      const avatarUrl = await getUnavatarUrl(linkedin_url);
      
      return new Response(
        JSON.stringify({
          success: false,
          fallback: true,
          message: "Could not fetch profile from Coresignal",
          data: {
            name: name || null,
            email: email || null,
            linkedin_url: linkedin_url,
            avatar_url: avatarUrl,
            title: null,
            company: null,
            location: null,
            bio: null,
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If Coresignal didn't return avatar, try unavatar
    let finalAvatarUrl = coresignalData.avatar_url;
    if (!finalAvatarUrl) {
      finalAvatarUrl = await getUnavatarUrl(linkedin_url);
    }

    const result = {
      success: true,
      fallback: false,
      source: "coresignal",
      data: {
        name: coresignalData.name || name || null,
        email: email || null,
        linkedin_url: linkedin_url,
        avatar_url: finalAvatarUrl,
        title: coresignalData.title || null,
        company: coresignalData.company || null,
        location: coresignalData.location || null,
        bio: coresignalData.bio || null,
      }
    };

    console.log("Returning enrichment result:", JSON.stringify(result.data));

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
