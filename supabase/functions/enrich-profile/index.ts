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

// Fetch profile data from LinkdAPI (RapidAPI)
async function fetchLinkdAPIProfile(linkedinUrl: string): Promise<{
  avatar_url: string | null;
  name: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
} | null> {
  const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
  if (!RAPIDAPI_KEY) {
    console.log("RAPIDAPI_KEY not configured");
    return null;
  }

  const username = extractLinkedInUsername(linkedinUrl);
  if (!username) {
    console.log("Could not extract LinkedIn username from:", linkedinUrl);
    return null;
  }

  try {
    console.log("Fetching LinkdAPI profile for:", username);
    
    const response = await fetch(
      `https://linkdapi-best-unofficial-linkedin-api.p.rapidapi.com/api/v1/profile/overview?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "linkdapi-best-unofficial-linkedin-api.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkdAPI error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("LinkdAPI response keys:", Object.keys(data));
    
    // Log available fields for debugging
    console.log("LinkdAPI profilePicture:", data.profilePicture || data.profile_picture || "NOT FOUND");
    console.log("LinkdAPI headline:", data.headline || "NOT FOUND");
    console.log("LinkdAPI summary:", data.summary || data.about || "NOT FOUND");
    console.log("LinkdAPI location:", data.location || data.geoLocationName || "NOT FOUND");

    // Check if avatar is LinkedIn's default placeholder (skip it)
    let avatarUrl = data.profilePicture || data.profile_picture || data.avatar || null;
    if (avatarUrl && avatarUrl.includes("static.licdn.com/aero-v1/sc/h/")) {
      console.log("Detected LinkedIn default placeholder, skipping avatar");
      avatarUrl = null;
    }

    // Extract title and company from headline or current position
    let title: string | null = null;
    let company: string | null = null;

    // Try to get current position from experiences
    const experiences = data.experiences || data.experience || data.positions || [];
    const currentJob = experiences.find((exp: any) => !exp.end_date && !exp.endDate && !exp.end) || experiences[0];
    
    if (currentJob) {
      title = currentJob.title || currentJob.position || currentJob.role || null;
      company = currentJob.company || currentJob.company_name || currentJob.companyName || null;
    }

    // Fallback: parse from headline (e.g., "CEO at Secure Group")
    if ((!title || !company) && data.headline) {
      const headlineMatch = data.headline.match(/^([^|]+?)\s+at\s+([^|]+)/i);
      if (headlineMatch) {
        title = title || headlineMatch[1].trim();
        company = company || headlineMatch[2].trim();
      }
      // If no "at" pattern, use headline as title
      if (!title && data.headline) {
        title = data.headline;
      }
    }

    // Build location
    const location = data.location || data.geoLocationName || data.geo_location || null;

    // Get bio/summary
    const bio = data.summary || data.about || data.description || null;

    // Get full name
    const fullName = data.fullName || data.full_name || data.name ||
                     (data.firstName && data.lastName 
                       ? `${data.firstName} ${data.lastName}` 
                       : data.first_name && data.last_name
                         ? `${data.first_name} ${data.last_name}`
                         : null);

    return {
      avatar_url: avatarUrl,
      name: fullName,
      title: title,
      company: company,
      location: location,
      bio: bio,
    };
  } catch (error) {
    console.error("LinkdAPI fetch error:", error);
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

    // Fetch profile from LinkdAPI
    const linkdApiData = await fetchLinkdAPIProfile(linkedin_url);
    
    if (!linkdApiData) {
      // Try unavatar as fallback for avatar only
      const avatarUrl = await getUnavatarUrl(linkedin_url);
      
      return new Response(
        JSON.stringify({
          success: false,
          fallback: true,
          message: "Could not fetch profile from LinkdAPI",
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

    // If LinkdAPI didn't return avatar, try unavatar
    let finalAvatarUrl = linkdApiData.avatar_url;
    if (!finalAvatarUrl) {
      finalAvatarUrl = await getUnavatarUrl(linkedin_url);
    }

    const result = {
      success: true,
      fallback: false,
      source: "linkdapi",
      data: {
        name: linkdApiData.name || name || null,
        email: email || null,
        linkedin_url: linkedin_url,
        avatar_url: finalAvatarUrl,
        title: linkdApiData.title || null,
        company: linkdApiData.company || null,
        location: linkdApiData.location || null,
        bio: linkdApiData.bio || null,
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
