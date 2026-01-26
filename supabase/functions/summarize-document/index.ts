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
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    // Create client with user's token to verify authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { documentId, filePath } = await req.json();

    if (!documentId || !filePath) {
      return new Response(
        JSON.stringify({ error: "documentId and filePath are required" }),
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

    // Fetch document types and issuing authorities for AI context
    const [docTypesResult, authoritiesResult] = await Promise.all([
      supabase.from("document_types").select("id, code, name, category"),
      supabase.from("issuing_authorities").select("id, name, country, province_state")
    ]);

    const documentTypes = docTypesResult.data || [];
    const issuingAuthorities = authoritiesResult.data || [];

    // Create lookup lists for the AI
    const docTypesList = documentTypes.map(dt => `${dt.code}: ${dt.name} (${dt.category})`).join("\n");
    const authoritiesList = issuingAuthorities.map(a => a.name).join(", ");

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

    // Convert to base64 safely for large files (avoid stack overflow)
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
            content: `You are a document analyst. Analyze the provided PDF document and extract structured information.

Available Document Types (use the code):
${docTypesList}

Available Issuing Authorities (use exact name if it matches):
${authoritiesList}

Extract all relevant information from the document. For dates, use YYYY-MM-DD format. For document type, match to the closest available type code. For issuing authority, match to the closest available authority name.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this document and extract all relevant information using the extract_document_data function:",
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
              name: "extract_document_data",
              description: "Extract structured data from a document including title, dates, issuing authority, and reference numbers",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "The document title or name (e.g., 'Delaware Certificate of Formation', 'California Articles of Incorporation')"
                  },
                  document_type_code: {
                    type: "string",
                    description: "The document type code from the available list (e.g., COI, COF, AOI, AOO, BYLAWS, etc.)"
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
                    description: "Filing number, document ID, entity number, or any official reference number"
                  },
                  summary: {
                    type: "string",
                    description: "A brief markdown summary of the document including key information, purpose, and notable details"
                  }
                },
                required: ["title", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_document_data" } }
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
    
    // Extract data from tool call
    let extractedData: {
      title?: string;
      document_type_code?: string;
      issued_date?: string;
      expiry_date?: string;
      issuing_authority?: string;
      reference_number?: string;
      summary?: string;
    } = {};

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        extractedData = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool call arguments:", e);
      }
    }

    // Fallback to content if no tool call
    if (!extractedData.summary && aiData.choices?.[0]?.message?.content) {
      extractedData.summary = aiData.choices[0].message.content;
    }

    const summary = extractedData.summary || "Unable to generate summary";

    // Find document type ID from code
    let documentTypeId: string | null = null;
    if (extractedData.document_type_code) {
      const docType = documentTypes.find(
        dt => dt.code.toLowerCase() === extractedData.document_type_code?.toLowerCase()
      );
      if (docType) {
        documentTypeId = docType.id;
      }
    }

    // Validate issuing authority exists
    let validatedAuthority: string | null = null;
    if (extractedData.issuing_authority) {
      const authority = issuingAuthorities.find(
        a => a.name.toLowerCase() === extractedData.issuing_authority?.toLowerCase()
      );
      if (authority) {
        validatedAuthority = authority.name;
      } else {
        // Try partial match
        const partialMatch = issuingAuthorities.find(
          a => a.name.toLowerCase().includes(extractedData.issuing_authority?.toLowerCase() || "") ||
               extractedData.issuing_authority?.toLowerCase().includes(a.name.toLowerCase())
        );
        if (partialMatch) {
          validatedAuthority = partialMatch.name;
        }
      }
    }

    // Update the document with the summary
    const { error: updateError } = await supabase
      .from("entity_documents")
      .update({
        ai_summary: summary,
        summary_generated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save summary" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary,
        extractedData: {
          title: extractedData.title || null,
          document_type_id: documentTypeId,
          issued_date: extractedData.issued_date || null,
          expiry_date: extractedData.expiry_date || null,
          issuing_authority: validatedAuthority,
          reference_number: extractedData.reference_number || null,
        }
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
