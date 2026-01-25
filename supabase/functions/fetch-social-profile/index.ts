import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { profileUrl } = await req.json();

    if (!profileUrl) {
      return new Response(
        JSON.stringify({ error: "Profile URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Detect platform and extract username from URL
    const urlLower = profileUrl.toLowerCase();
    let platform = "";
    let username = "";
    let icon = "";
    let color = "bg-zinc-800";
    let avatar_url = "";

    // Instagram
    if (urlLower.includes("instagram.com")) {
      platform = "Instagram";
      icon = "📸";
      color = "bg-pink-600";
      const match = profileUrl.match(/instagram\.com\/([^/?]+)/i);
      if (match) {
        username = "@" + match[1];
        // Instagram CDN avatar URL pattern (public avatars)
        avatar_url = `https://www.instagram.com/${match[1]}/?__a=1`;
      }
    }
    // Twitter/X
    else if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
      platform = "X (Twitter)";
      icon = "𝕏";
      color = "bg-black";
      const match = profileUrl.match(/(?:twitter|x)\.com\/([^/?]+)/i);
      if (match) {
        username = "@" + match[1];
        // Use unavatar.io service for Twitter avatars
        avatar_url = `https://unavatar.io/twitter/${match[1]}`;
      }
    }
    // LinkedIn
    else if (urlLower.includes("linkedin.com")) {
      platform = "LinkedIn";
      icon = "in";
      color = "bg-blue-600";
      const match = profileUrl.match(/linkedin\.com\/(?:in|company)\/([^/?]+)/i);
      if (match) {
        username = match[1];
        // Use unavatar.io for LinkedIn
        avatar_url = `https://unavatar.io/linkedin/${match[1]}`;
      }
    }
    // Facebook
    else if (urlLower.includes("facebook.com") || urlLower.includes("fb.com")) {
      platform = "Facebook";
      icon = "f";
      color = "bg-blue-600";
      const match = profileUrl.match(/(?:facebook|fb)\.com\/([^/?]+)/i);
      if (match) {
        username = match[1];
        // Facebook Graph API avatar (public pages)
        avatar_url = `https://graph.facebook.com/${match[1]}/picture?type=large`;
      }
    }
    // YouTube
    else if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      platform = "YouTube";
      icon = "▶";
      color = "bg-red-600";
      const match = profileUrl.match(/youtube\.com\/(?:@|c\/|channel\/|user\/)?([^/?]+)/i);
      if (match) {
        username = "@" + match[1];
        // Use unavatar.io for YouTube
        avatar_url = `https://unavatar.io/youtube/${match[1]}`;
      }
    }
    // TikTok
    else if (urlLower.includes("tiktok.com")) {
      platform = "TikTok";
      icon = "♪";
      color = "bg-black";
      const match = profileUrl.match(/tiktok\.com\/@?([^/?]+)/i);
      if (match) {
        username = "@" + match[1].replace("@", "");
        avatar_url = `https://unavatar.io/tiktok/${match[1].replace("@", "")}`;
      }
    }
    // GitHub
    else if (urlLower.includes("github.com")) {
      platform = "GitHub";
      icon = "🐙";
      color = "bg-zinc-800";
      const match = profileUrl.match(/github\.com\/([^/?]+)/i);
      if (match) {
        username = match[1];
        // GitHub has direct avatar URLs
        avatar_url = `https://github.com/${match[1]}.png`;
      }
    }
    // Pinterest
    else if (urlLower.includes("pinterest.com")) {
      platform = "Pinterest";
      icon = "📌";
      color = "bg-red-600";
      const match = profileUrl.match(/pinterest\.com\/([^/?]+)/i);
      if (match) {
        username = match[1];
        avatar_url = `https://unavatar.io/pinterest/${match[1]}`;
      }
    }
    // Threads
    else if (urlLower.includes("threads.net")) {
      platform = "Threads";
      icon = "@";
      color = "bg-black";
      const match = profileUrl.match(/threads\.net\/@?([^/?]+)/i);
      if (match) {
        username = "@" + match[1].replace("@", "");
        // Use Instagram avatar since Threads uses Instagram accounts
        avatar_url = `https://unavatar.io/instagram/${match[1].replace("@", "")}`;
      }
    }
    // Snapchat
    else if (urlLower.includes("snapchat.com")) {
      platform = "Snapchat";
      icon = "👻";
      color = "bg-yellow-400";
      const match = profileUrl.match(/snapchat\.com\/add\/([^/?]+)/i);
      if (match) {
        username = match[1];
        // Snapchat Bitmoji/avatar URL
        avatar_url = `https://app.snapchat.com/web/deeplink/snapcode?username=${match[1]}&type=SVG`;
      }
    }
    // Twitch
    else if (urlLower.includes("twitch.tv")) {
      platform = "Twitch";
      icon = "📺";
      color = "bg-purple-600";
      const match = profileUrl.match(/twitch\.tv\/([^/?]+)/i);
      if (match) {
        username = match[1];
        avatar_url = `https://unavatar.io/twitch/${match[1]}`;
      }
    }
    // Discord
    else if (urlLower.includes("discord.gg") || urlLower.includes("discord.com")) {
      platform = "Discord";
      icon = "💬";
      color = "bg-indigo-600";
      const match = profileUrl.match(/discord\.(?:gg|com\/invite)\/([^/?]+)/i);
      if (match) {
        username = match[1];
      }
    }
    // Telegram
    else if (urlLower.includes("t.me") || urlLower.includes("telegram.me")) {
      platform = "Telegram";
      icon = "✈";
      color = "bg-blue-500";
      const match = profileUrl.match(/(?:t\.me|telegram\.me)\/([^/?]+)/i);
      if (match) {
        username = "@" + match[1];
        avatar_url = `https://unavatar.io/telegram/${match[1]}`;
      }
    }
    // WhatsApp
    else if (urlLower.includes("wa.me") || urlLower.includes("whatsapp.com")) {
      platform = "WhatsApp";
      icon = "📱";
      color = "bg-green-600";
      const match = profileUrl.match(/wa\.me\/([^/?]+)/i);
      if (match) {
        username = "+" + match[1];
      }
    }
    // Medium
    else if (urlLower.includes("medium.com")) {
      platform = "Medium";
      icon = "M";
      color = "bg-zinc-800";
      const match = profileUrl.match(/medium\.com\/@?([^/?]+)/i);
      if (match) {
        username = "@" + match[1].replace("@", "");
        avatar_url = `https://unavatar.io/medium/${match[1].replace("@", "")}`;
      }
    }
    // Reddit
    else if (urlLower.includes("reddit.com")) {
      platform = "Reddit";
      icon = "🤖";
      color = "bg-orange-600";
      const match = profileUrl.match(/reddit\.com\/(?:u|user|r)\/([^/?]+)/i);
      if (match) {
        username = "u/" + match[1];
        avatar_url = `https://unavatar.io/reddit/${match[1]}`;
      }
    }
    // Dribbble
    else if (urlLower.includes("dribbble.com")) {
      platform = "Dribbble";
      icon = "🏀";
      color = "bg-pink-500";
      const match = profileUrl.match(/dribbble\.com\/([^/?]+)/i);
      if (match) {
        username = match[1];
        avatar_url = `https://unavatar.io/dribbble/${match[1]}`;
      }
    }
    // Behance
    else if (urlLower.includes("behance.net")) {
      platform = "Behance";
      icon = "Bē";
      color = "bg-blue-800";
      const match = profileUrl.match(/behance\.net\/([^/?]+)/i);
      if (match) {
        username = match[1];
        avatar_url = `https://unavatar.io/behance/${match[1]}`;
      }
    }
    else {
      // Try to extract domain as platform name
      try {
        const url = new URL(profileUrl);
        platform = url.hostname.replace("www.", "").split(".")[0];
        platform = platform.charAt(0).toUpperCase() + platform.slice(1);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) username = pathParts[pathParts.length - 1];
        // Try unavatar.io as fallback
        if (username) {
          avatar_url = `https://unavatar.io/${url.hostname.replace("www.", "")}/${username}`;
        }
      } catch {
        platform = "Other";
      }
    }

    return new Response(
      JSON.stringify({
        platform,
        username,
        icon,
        color,
        profile_url: profileUrl,
        avatar_url: avatar_url || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error fetching social profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
