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

// Fetch profile data from LinkdAPI (Direct API)
async function fetchLinkdAPIProfile(linkedinUrl: string): Promise<{
  avatar_url: string | null;
  name: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
} | null> {
  const LINKDAPI_KEY = Deno.env.get("LINKDAPI_KEY");
  if (!LINKDAPI_KEY) {
    console.log("LINKDAPI_KEY not configured");
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
      `https://api.linkdapi.com/api/v1/profile/overview?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${LINKDAPI_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkdAPI error:", response.status, errorText);
      return null;
    }

    const responseData = await response.json();
    console.log("LinkdAPI response keys:", Object.keys(responseData));
    
    // The actual profile data is nested inside responseData.data
    const data = responseData.data;
    
    if (!data) {
      console.error("LinkdAPI returned no data object");
      return null;
    }
    
    console.log("LinkdAPI data keys:", Object.keys(data));
    
    // Log available fields for debugging
    console.log("LinkdAPI profilePictureURL:", data.profilePictureURL || "NOT FOUND");
    console.log("LinkdAPI headline:", data.headline || "NOT FOUND");
    console.log("LinkdAPI summary:", data.summary || data.about || "NOT FOUND");
    console.log("LinkdAPI location:", data.location || "NOT FOUND");
    console.log("LinkdAPI firstName:", data.firstName || "NOT FOUND");
    console.log("LinkdAPI lastName:", data.lastName || "NOT FOUND");
    console.log("LinkdAPI CurrentPositions:", data.CurrentPositions || "NOT FOUND");

    // Check if avatar is LinkedIn's default placeholder (skip it)
    let avatarUrl = data.profilePictureURL || data.profilePictureUrl || data.profilePicture || null;
    if (avatarUrl && avatarUrl.includes("static.licdn.com/aero-v1/sc/h/")) {
      console.log("Detected LinkedIn default placeholder, skipping avatar");
      avatarUrl = null;
    }

    // Extract title and company from CurrentPositions (LinkdAPI uses this field name)
    let title: string | null = null;
    let company: string | null = null;

    // Try to get current position from CurrentPositions array
    const positions = data.CurrentPositions || data.currentPositions || data.experiences || [];
    if (positions.length > 0) {
      const currentJob = positions[0];
      title = currentJob.title || currentJob.position || currentJob.role || null;
      company = currentJob.companyName || currentJob.company || currentJob.company_name || null;
    }

    // Fallback: parse from headline (e.g., "CEO at Secure Group" or "Title | Company")
    if ((!title || !company) && data.headline) {
      // Try "at" pattern first
      const atMatch = data.headline.match(/^([^|]+?)\s+at\s+([^|]+)/i);
      if (atMatch) {
        title = title || atMatch[1].trim();
        company = company || atMatch[2].trim();
      } else {
        // Try pipe pattern "Title | Company"
        const pipeMatch = data.headline.match(/\|\s*(?:Founder of|CEO of|Owner of)?\s*(.+)$/i);
        if (pipeMatch) {
          company = company || pipeMatch[1].trim();
        }
      }
      // If still no title, use the first part of headline before any pipe
      if (!title && data.headline) {
        title = data.headline.split('|')[0].trim();
      }
    }

    // Build location - handle object structure
    let location: string | null = null;
    if (data.location) {
      if (typeof data.location === 'string') {
        location = data.location;
      } else if (data.location.fullLocation) {
        location = data.location.fullLocation;
      } else if (data.location.city && data.location.countryName) {
        location = `${data.location.city}, ${data.location.countryName}`;
      }
    }

    // Get bio/summary
    const bio = data.summary || data.about || data.description || null;

    // Get full name
    const fullName = data.fullName || data.full_name || data.name ||
                     (data.firstName && data.lastName 
                       ? `${data.firstName} ${data.lastName}` 
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
