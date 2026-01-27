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
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

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

    const { filePath, fileName } = await req.json();

    if (!filePath || !fileName) {
      return new Response(
        JSON.stringify({ error: "filePath and fileName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch entities for context
    const { data: entities } = await supabase
      .from("entities")
      .select("id, name, type, jurisdiction");

    const entitiesList = (entities || [])
      .map(e => `${e.name} (${e.type}, ${e.jurisdiction || 'Unknown jurisdiction'})`)
      .join("\n");

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("contract-files")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert to base64 safely
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const chunkSize = 8192;
    let base64Content = "";
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      base64Content += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64Content = btoa(base64Content);

    // Contract types for matching
    const contractTypes = ["General", "Lease", "Service", "Employment", "NDA", "Partnership", "Vendor"];

    // Use Lovable AI with tool calling for structured extraction
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
            content: `You are a legal contract analyst. Analyze the provided contract PDF and extract structured information.

Your task is to:
1. Identify the contract title
2. Determine the contract type from: ${contractTypes.join(", ")}
3. Identify all parties involved in the contract
4. Extract start date and end date if mentioned
5. Identify which company/entity this contract belongs to from the available list
6. Generate a comprehensive summary of the contract

AVAILABLE ENTITIES (match to the most likely one based on contract content):
${entitiesList || "No entities available"}

For dates, use YYYY-MM-DD format. Match entities as closely as possible to the available options.
If you cannot determine the entity, leave entity_name empty.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this contract document (filename: ${fileName}) and extract all relevant information using the analyze_contract function:`,
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
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_contract",
              description: "Analyze and extract structured data from a legal contract",
              parameters: {
                type: "object",
                properties: {
                  entity_name: {
                    type: "string",
                    description: "The name of the entity/company this contract belongs to (from the available list)"
                  },
                  title: {
                    type: "string",
                    description: "The contract title (e.g., 'Office Lease Agreement', 'Software License Agreement')"
                  },
                  contract_type: {
                    type: "string",
                    enum: contractTypes,
                    description: "The type of contract from the available options"
                  },
                  parties: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of all parties involved in the contract"
                  },
                  start_date: {
                    type: "string",
                    description: "The contract start/effective date in YYYY-MM-DD format"
                  },
                  end_date: {
                    type: "string",
                    description: "The contract end/expiration date in YYYY-MM-DD format"
                  },
                  status: {
                    type: "string",
                    enum: ["active", "pending", "expired", "terminated"],
                    description: "The current status of the contract based on dates"
                  },
                  summary: {
                    type: "string",
                    description: "A comprehensive summary of the contract including key terms, obligations, and notable clauses"
                  },
                  key_terms: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of key terms or important clauses in the contract"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score 0-100 for the extraction accuracy"
                  }
                },
                required: ["title", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_contract" } }
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
        JSON.stringify({ error: "Failed to analyze contract" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    
    // Extract data from tool call
    let extractedData: {
      entity_name?: string;
      title?: string;
      contract_type?: string;
      parties?: string[];
      start_date?: string;
      end_date?: string;
      status?: string;
      summary?: string;
      key_terms?: string[];
      confidence?: number;
    } = {};

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        extractedData = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool call arguments:", e);
      }
    }

    // Match entity
    let matchedEntity: { id: string; name: string } | null = null;
    if (extractedData.entity_name && entities) {
      const entity = entities.find(
        e => e.name.toLowerCase() === extractedData.entity_name?.toLowerCase()
      );
      if (entity) {
        matchedEntity = { id: entity.id, name: entity.name };
      } else {
        // Try partial match
        const partialMatch = entities.find(
          e => e.name.toLowerCase().includes(extractedData.entity_name?.toLowerCase() || "") ||
               extractedData.entity_name?.toLowerCase().includes(e.name.toLowerCase())
        );
        if (partialMatch) {
          matchedEntity = { id: partialMatch.id, name: partialMatch.name };
        }
      }
    }

    // Determine status based on dates if not provided
    let status = extractedData.status || "active";
    if (extractedData.end_date) {
      const endDate = new Date(extractedData.end_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      if (endDate < now) {
        status = "expired";
      } else if (endDate <= thirtyDaysFromNow) {
        status = "expiring-soon";
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        extractedData: {
          entity_id: matchedEntity?.id || null,
          entity_name: matchedEntity?.name || extractedData.entity_name || null,
          title: extractedData.title || fileName.replace(/\.[^/.]+$/, ""),
          type: extractedData.contract_type || "General",
          parties: extractedData.parties || [],
          start_date: extractedData.start_date || null,
          end_date: extractedData.end_date || null,
          status: status,
          summary: extractedData.summary || null,
          key_terms: extractedData.key_terms || [],
          confidence: extractedData.confidence || 0,
        },
        availableEntities: (entities || []).map(e => ({ id: e.id, name: e.name })),
      }),
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
