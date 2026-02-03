import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const webhookSecret = Deno.env.get("INBOUND_EMAIL_WEBHOOK_SECRET");

    // Validate webhook secret if configured
    const providedSecret = req.headers.get("x-webhook-secret");
    if (webhookSecret && providedSecret !== webhookSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    const { from, subject, filename, content, receivedAt } = payload;

    if (!from || !filename || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: from, filename, content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type
    if (!filename.toLowerCase().endsWith('.pdf')) {
      return new Response(
        JSON.stringify({ error: "Only PDF files are accepted" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Decode base64 content
    let fileBuffer: Uint8Array;
    try {
      const binaryString = atob(content);
      fileBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i);
      }
    } catch (e) {
      console.error("Failed to decode base64 content:", e);
      return new Response(
        JSON.stringify({ error: "Invalid base64 content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check file size (10MB max)
    if (fileBuffer.length > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 10MB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `inbound/${timestamp}_${sanitizedFilename}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("entity-documents")
      .upload(filePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload file to storage" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run AI analysis if API key is available
    let aiAnalysis: Record<string, unknown> | null = null;
    let suggestedEntityId: string | null = null;
    let suggestedDocTypeId: string | null = null;

    if (lovableApiKey) {
      try {
        // Fetch reference data for AI context
        const [entitiesResult, docTypesResult, authoritiesResult] = await Promise.all([
          supabase.from("entities").select("id, name, type, jurisdiction"),
          supabase.from("document_types").select("id, code, name, category"),
          supabase.from("issuing_authorities").select("id, name, country, province_state")
        ]);

        const entities = entitiesResult.data || [];
        const documentTypes = docTypesResult.data || [];
        const issuingAuthorities = authoritiesResult.data || [];

        const entitiesList = entities.map(e => `${e.name} (${e.type}, ${e.jurisdiction || 'Unknown jurisdiction'})`).join("\n");
        const docTypesList = documentTypes.map(dt => `${dt.code}: ${dt.name} (${dt.category})`).join("\n");
        const authoritiesList = issuingAuthorities.map(a => `${a.name} (${a.country}${a.province_state ? ', ' + a.province_state : ''})`).join("\n");

        // Use Lovable AI for analysis
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
                    text: `Analyze this document (filename: ${filename}, received from: ${from}) and extract all relevant information:`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:application/pdf;base64,${content}`,
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
                        description: "The name of the entity/company this document belongs to"
                      },
                      title: {
                        type: "string",
                        description: "The document title"
                      },
                      document_type_code: {
                        type: "string",
                        description: "The document type code from the available list"
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
                        description: "The name of the issuing authority"
                      },
                      reference_number: {
                        type: "string",
                        description: "Filing number, document ID, or any official reference"
                      },
                      summary: {
                        type: "string",
                        description: "A brief summary of the document's purpose"
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

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          
          if (toolCall?.function?.arguments) {
            const extractedData = JSON.parse(toolCall.function.arguments);
            
            // Match entity
            if (extractedData.entity_name) {
              const entity = entities.find(
                e => e.name.toLowerCase() === extractedData.entity_name?.toLowerCase()
              ) || entities.find(
                e => e.name.toLowerCase().includes(extractedData.entity_name?.toLowerCase()) ||
                     extractedData.entity_name?.toLowerCase().includes(e.name.toLowerCase())
              );
              if (entity) {
                suggestedEntityId = entity.id;
              }
            }

            // Match document type
            if (extractedData.document_type_code) {
              const docType = documentTypes.find(
                dt => dt.code.toLowerCase() === extractedData.document_type_code?.toLowerCase()
              );
              if (docType) {
                suggestedDocTypeId = docType.id;
              }
            }

            aiAnalysis = {
              ...extractedData,
              matched_entity_id: suggestedEntityId,
              matched_doc_type_id: suggestedDocTypeId,
            };
          }
        } else {
          console.error("AI analysis failed:", await aiResponse.text());
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
        // Continue without AI analysis
      }
    }

    // Insert into queue
    const { data: queueItem, error: insertError } = await supabase
      .from("inbound_document_queue")
      .insert({
        email_from: from,
        email_subject: subject || null,
        email_received_at: receivedAt || new Date().toISOString(),
        file_name: filename,
        file_path: filePath,
        ai_analysis: aiAnalysis,
        suggested_entity_id: suggestedEntityId,
        suggested_doc_type_id: suggestedDocTypeId,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to queue document" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Document queued successfully: ${queueItem.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Document queued for review",
        queueId: queueItem.id,
        aiAnalysisAvailable: !!aiAnalysis,
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
