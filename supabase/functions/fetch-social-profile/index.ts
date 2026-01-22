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

    // Instagram
    if (urlLower.includes("instagram.com")) {
      platform = "Instagram";
      icon = "📸";
      color = "bg-pink-600";
      const match = profileUrl.match(/instagram\.com\/([^/?]+)/i);
      if (match) username = "@" + match[1];
    }
    // Twitter/X
    else if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
      platform = "X (Twitter)";
      icon = "𝕏";
      color = "bg-black";
      const match = profileUrl.match(/(?:twitter|x)\.com\/([^/?]+)/i);
      if (match) username = "@" + match[1];
    }
    // LinkedIn
    else if (urlLower.includes("linkedin.com")) {
      platform = "LinkedIn";
      icon = "in";
      color = "bg-blue-600";
      const match = profileUrl.match(/linkedin\.com\/(?:in|company)\/([^/?]+)/i);
      if (match) username = match[1];
    }
    // Facebook
    else if (urlLower.includes("facebook.com") || urlLower.includes("fb.com")) {
      platform = "Facebook";
      icon = "f";
      color = "bg-blue-600";
      const match = profileUrl.match(/(?:facebook|fb)\.com\/([^/?]+)/i);
      if (match) username = match[1];
    }
    // YouTube
    else if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      platform = "YouTube";
      icon = "▶";
      color = "bg-red-600";
      const match = profileUrl.match(/youtube\.com\/(?:@|c\/|channel\/|user\/)?([^/?]+)/i);
      if (match) username = "@" + match[1];
    }
    // TikTok
    else if (urlLower.includes("tiktok.com")) {
      platform = "TikTok";
      icon = "♪";
      color = "bg-black";
      const match = profileUrl.match(/tiktok\.com\/@?([^/?]+)/i);
      if (match) username = "@" + match[1].replace("@", "");
    }
    // GitHub
    else if (urlLower.includes("github.com")) {
      platform = "GitHub";
      icon = "🐙";
      color = "bg-zinc-800";
      const match = profileUrl.match(/github\.com\/([^/?]+)/i);
      if (match) username = match[1];
    }
    // Pinterest
    else if (urlLower.includes("pinterest.com")) {
      platform = "Pinterest";
      icon = "📌";
      color = "bg-red-600";
      const match = profileUrl.match(/pinterest\.com\/([^/?]+)/i);
      if (match) username = match[1];
    }
    // Threads
    else if (urlLower.includes("threads.net")) {
      platform = "Threads";
      icon = "@";
      color = "bg-black";
      const match = profileUrl.match(/threads\.net\/@?([^/?]+)/i);
      if (match) username = "@" + match[1].replace("@", "");
    }
    // Snapchat
    else if (urlLower.includes("snapchat.com")) {
      platform = "Snapchat";
      icon = "👻";
      color = "bg-yellow-400";
      const match = profileUrl.match(/snapchat\.com\/add\/([^/?]+)/i);
      if (match) username = match[1];
    }
    // Twitch
    else if (urlLower.includes("twitch.tv")) {
      platform = "Twitch";
      icon = "📺";
      color = "bg-purple-600";
      const match = profileUrl.match(/twitch\.tv\/([^/?]+)/i);
      if (match) username = match[1];
    }
    // Discord
    else if (urlLower.includes("discord.gg") || urlLower.includes("discord.com")) {
      platform = "Discord";
      icon = "💬";
      color = "bg-indigo-600";
      const match = profileUrl.match(/discord\.(?:gg|com\/invite)\/([^/?]+)/i);
      if (match) username = match[1];
    }
    // Telegram
    else if (urlLower.includes("t.me") || urlLower.includes("telegram.me")) {
      platform = "Telegram";
      icon = "✈";
      color = "bg-blue-500";
      const match = profileUrl.match(/(?:t\.me|telegram\.me)\/([^/?]+)/i);
      if (match) username = "@" + match[1];
    }
    // WhatsApp
    else if (urlLower.includes("wa.me") || urlLower.includes("whatsapp.com")) {
      platform = "WhatsApp";
      icon = "📱";
      color = "bg-green-600";
      const match = profileUrl.match(/wa\.me\/([^/?]+)/i);
      if (match) username = "+" + match[1];
    }
    // Medium
    else if (urlLower.includes("medium.com")) {
      platform = "Medium";
      icon = "M";
      color = "bg-zinc-800";
      const match = profileUrl.match(/medium\.com\/@?([^/?]+)/i);
      if (match) username = "@" + match[1].replace("@", "");
    }
    // Reddit
    else if (urlLower.includes("reddit.com")) {
      platform = "Reddit";
      icon = "🤖";
      color = "bg-orange-600";
      const match = profileUrl.match(/reddit\.com\/(?:u|user|r)\/([^/?]+)/i);
      if (match) username = "u/" + match[1];
    }
    else {
      // Try to extract domain as platform name
      try {
        const url = new URL(profileUrl);
        platform = url.hostname.replace("www.", "").split(".")[0];
        platform = platform.charAt(0).toUpperCase() + platform.slice(1);
        const pathParts = url.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) username = pathParts[pathParts.length - 1];
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
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching social profile:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
