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

    // Fetch all reference data for AI context
    const [entitiesResult, docTypesResult, authoritiesResult] = await Promise.all([
      supabase.from("entities").select("id, name, type, jurisdiction"),
      supabase.from("document_types").select("id, code, name, category"),
      supabase.from("issuing_authorities").select("id, name, country, province_state")
    ]);

    const entities = entitiesResult.data || [];
    const documentTypes = docTypesResult.data || [];
    const issuingAuthorities = authoritiesResult.data || [];

    // Create lookup lists for the AI
    const entitiesList = entities.map(e => `${e.name} (${e.type}, ${e.jurisdiction || 'Unknown jurisdiction'})`).join("\n");
    const docTypesList = documentTypes.map(dt => `${dt.code}: ${dt.name} (${dt.category})`).join("\n");
    const authoritiesList = issuingAuthorities.map(a => `${a.name} (${a.country}${a.province_state ? ', ' + a.province_state : ''})`).join("\n");

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("entity-documents")
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
            content: `You are a corporate document analyst. Analyze the provided document and extract structured information.

Your task is to:
1. Identify which company/entity this document belongs to from the available list
2. Determine the document type from the available types
3. Extract all relevant metadata (dates, reference numbers, issuing authority)
4. Generate a brief summary

AVAILABLE ENTITIES (match to the most likely one based on document content):
${entitiesList}

AVAILABLE DOCUMENT TYPES (use the code):
${docTypesList}

AVAILABLE ISSUING AUTHORITIES (use exact name if it matches):
${authoritiesList}

For dates, use YYYY-MM-DD format. Match entities, document types, and authorities as closely as possible to the available options.
If you cannot determine the entity, leave entity_name empty.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this document (filename: ${fileName}) and extract all relevant information using the analyze_document function:`,
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
              name: "analyze_document",
              description: "Analyze and extract structured data from a corporate document",
              parameters: {
                type: "object",
                properties: {
                  entity_name: {
                    type: "string",
                    description: "The name of the entity/company this document belongs to (from the available list)"
                  },
                  title: {
                    type: "string",
                    description: "The document title (e.g., 'Delaware Certificate of Formation')"
                  },
                  document_type_code: {
                    type: "string",
                    description: "The document type code from the available list (e.g., COI, COF, BYLAWS)"
                  },
                  issued_date: {
                    type: "string",
                    description: "The date the document was issued in YYYY-MM-DD format"
                  },
                  expiry_date: {
                    type: "string",
                    description: "The expiration date if any in YYYY-MM-DD format"
                  },
                  issuing_authority: {
                    type: "string",
                    description: "The name of the issuing authority from the available list"
                  },
                  reference_number: {
                    type: "string",
                    description: "Filing number, document ID, entity number, or any official reference"
                  },
                  summary: {
                    type: "string",
                    description: "A brief summary of the document's purpose and key information"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score 0-100 for the entity identification"
                  }
                },
                required: ["title", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_document" } }
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
        JSON.stringify({ error: "Failed to analyze document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    
    // Extract data from tool call
    let extractedData: {
      entity_name?: string;
      title?: string;
      document_type_code?: string;
      issued_date?: string;
      expiry_date?: string;
      issuing_authority?: string;
      reference_number?: string;
      summary?: string;
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
    if (extractedData.entity_name) {
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

    // Match document type
    let matchedDocType: { id: string; code: string; name: string; category: string } | null = null;
    if (extractedData.document_type_code) {
      const docType = documentTypes.find(
        dt => dt.code.toLowerCase() === extractedData.document_type_code?.toLowerCase()
      );
      if (docType) {
        matchedDocType = docType;
      }
    }

    // Match issuing authority
    let matchedAuthority: { id: string; name: string } | null = null;
    if (extractedData.issuing_authority) {
      const authority = issuingAuthorities.find(
        a => a.name.toLowerCase() === extractedData.issuing_authority?.toLowerCase()
      );
      if (authority) {
        matchedAuthority = { id: authority.id, name: authority.name };
      } else {
        const partialMatch = issuingAuthorities.find(
          a => a.name.toLowerCase().includes(extractedData.issuing_authority?.toLowerCase() || "") ||
               extractedData.issuing_authority?.toLowerCase().includes(a.name.toLowerCase())
        );
        if (partialMatch) {
          matchedAuthority = { id: partialMatch.id, name: partialMatch.name };
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          entity: matchedEntity,
          title: extractedData.title || fileName.replace(/\.[^/.]+$/, ""),
          documentType: matchedDocType,
          issuedDate: extractedData.issued_date || null,
          expiryDate: extractedData.expiry_date || null,
          issuingAuthority: matchedAuthority?.name || extractedData.issuing_authority || null,
          referenceNumber: extractedData.reference_number || null,
          summary: extractedData.summary || null,
          confidence: extractedData.confidence || 0,
        },
        // Include all options for user selection
        availableEntities: entities.map(e => ({ id: e.id, name: e.name })),
        availableDocTypes: documentTypes,
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
