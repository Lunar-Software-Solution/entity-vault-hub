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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    // Create client with user's token to verify authentication using getClaims
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseAuth.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { contractId, filePath } = await req.json();

    if (!contractId || !filePath) {
      return new Response(
        JSON.stringify({ error: "contractId and filePath are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for data operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let fileData: Blob;
    
    // Check if filePath is an external URL or a storage path
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      // Fetch from external URL (e.g., DocuSeal)
      console.log("Fetching from external URL:", filePath);
      const externalResponse = await fetch(filePath);
      if (!externalResponse.ok) {
        console.error("External fetch error:", externalResponse.status, externalResponse.statusText);
        return new Response(
          JSON.stringify({ error: "Failed to download file from external source" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      fileData = await externalResponse.blob();
    } else {
      // Download from Supabase storage
      console.log("Downloading from storage:", filePath);
      const { data: storageData, error: downloadError } = await supabase.storage
        .from("contract-files")
        .download(filePath);

      if (downloadError || !storageData) {
        console.error("Download error:", downloadError);
        return new Response(
          JSON.stringify({ error: "Failed to download file" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      fileData = storageData;
    }

    // Extract text from PDF (basic approach - works for text-based PDFs)
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 safely for large files (avoid stack overflow)
    const chunkSize = 8192;
    let base64Content = "";
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      base64Content += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64Content = btoa(base64Content);
    
    // Use Lovable AI to summarize the contract
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a legal document analyst. Analyze the provided PDF contract and create a comprehensive summary. Include:
1. **Document Type**: What kind of contract this is
2. **Parties Involved**: Who are the main parties
3. **Key Terms**: Important dates, amounts, obligations
4. **Main Provisions**: Core agreements and conditions
5. **Notable Clauses**: Any unusual or important clauses
6. **Potential Concerns**: Any red flags or items needing attention

Be concise but thorough. Format your response in markdown.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze and summarize this contract PDF document:",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Content}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate summary" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || "Unable to generate summary";

    // Update the contract with the summary
    const { error: updateError } = await supabase
      .from("contracts")
      .update({
        ai_summary: summary,
        summary_generated_at: new Date().toISOString(),
      })
      .eq("id", contractId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save summary" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
