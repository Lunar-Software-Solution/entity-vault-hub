import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DocuSealSubmission {
  id: number;
  source: string;
  submitters: Array<{
    id: number;
    name: string;
    email: string;
    status: string;
    completed_at: string | null;
  }>;
  template: {
    id: number;
    name: string;
    folder_name?: string;
  };
  status: string;
  created_at: string;
  completed_at: string | null;
  audit_log_url?: string;
  combined_document_url?: string;
}

interface DocuSealDocument {
  name: string;
  url: string;
}

interface AIAnalysisResult {
  title?: string;
  contract_type?: string;
  parties?: string[];
  start_date?: string;
  end_date?: string;
  status?: string;
  summary?: string;
  key_terms?: string[];
}

// Analyze a contract PDF with AI
async function analyzeContractWithAI(
  pdfUrl: string,
  fileName: string,
  lovableApiKey: string,
  entities: Array<{ id: string; name: string; type: string; jurisdiction: string | null }>
): Promise<AIAnalysisResult | null> {
  try {
    // Download the PDF from DocuSeal URL
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      console.error(`Failed to download PDF from ${pdfUrl}: ${pdfResponse.status}`);
      return null;
    }

    const pdfData = await pdfResponse.arrayBuffer();
    const uint8Array = new Uint8Array(pdfData);
    
    // Convert to base64 safely
    const chunkSize = 8192;
    let base64Content = "";
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      base64Content += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64Content = btoa(base64Content);

    const entitiesList = entities
      .map(e => `${e.name} (${e.type}, ${e.jurisdiction || 'Unknown jurisdiction'})`)
      .join("\n");

    const contractTypes = ["General", "Lease", "Service", "Employment", "NDA", "Partnership", "Vendor", "HR", "Business"];

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
5. Generate a brief summary of the contract

AVAILABLE ENTITIES (match to the most likely one based on contract content):
${entitiesList || "No entities available"}

For dates, use YYYY-MM-DD format.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this contract document (filename: ${fileName}) and extract all relevant information:`,
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
              description: "Extract structured data from a legal contract",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "The contract title" },
                  contract_type: { type: "string", enum: contractTypes, description: "The type of contract" },
                  parties: { type: "array", items: { type: "string" }, description: "List of parties" },
                  start_date: { type: "string", description: "Start date in YYYY-MM-DD format" },
                  end_date: { type: "string", description: "End date in YYYY-MM-DD format" },
                  summary: { type: "string", description: "Brief summary of the contract" },
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
      console.error(`AI analysis failed: ${aiResponse.status}`);
      return null;
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      return JSON.parse(toolCall.function.arguments);
    }
    
    return null;
  } catch (error) {
    console.error("AI analysis error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DOCUSEAL_API_KEY = Deno.env.get("DOCUSEAL_API_KEY");
    const DOCUSEAL_URL = Deno.env.get("DOCUSEAL_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!DOCUSEAL_API_KEY || !DOCUSEAL_URL) {
      throw new Error("DocuSeal configuration missing");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    // Validate user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user with getClaims (works with custom signing keys)
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.error("Auth error:", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body for optional filters
    const body = await req.json().catch(() => ({}));
    const { status: statusFilter, limit = 100 } = body;

    // Fetch submissions from DocuSeal API
    const docusealUrl = DOCUSEAL_URL.replace(/\/$/, "");
    let apiUrl = `${docusealUrl}/api/submissions?limit=${limit}`;
    if (statusFilter && statusFilter !== "all") {
      apiUrl += `&status=${statusFilter}`;
    }

    console.log("Fetching from DocuSeal:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": DOCUSEAL_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DocuSeal API error:", response.status, errorText);
      throw new Error(`DocuSeal API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("DocuSeal API response type:", typeof responseData, Array.isArray(responseData));
    
    // Handle different response formats - API may return array directly or wrapped in object
    let submissions: DocuSealSubmission[] = [];
    if (Array.isArray(responseData)) {
      submissions = responseData;
    } else if (responseData && typeof responseData === 'object') {
      // Try common wrapper keys
      submissions = responseData.data || responseData.submissions || responseData.items || [];
    }
    
    console.log(`Fetched ${submissions.length} submissions from DocuSeal`);

    // Fetch entities for AI context
    const { data: entities } = await supabase
      .from("entities")
      .select("id, name, type, jurisdiction");

    // Get existing contracts with docuseal_id to avoid duplicates
    const { data: existingContracts } = await supabase
      .from("contracts")
      .select("id, docuseal_id")
      .not("docuseal_id", "is", null);

    const existingDocusealIds = new Set(
      existingContracts?.map((c) => c.docuseal_id) || []
    );

    // Transform and insert new contracts
    const newContracts = [];
    const updatedContracts = [];

    for (const submission of submissions) {
      const parties = submission.submitters.map(
        (s) => s.name || s.email
      );
      
      // Map DocuSeal status to our contract status
      let contractStatus = "pending";
      if (submission.status === "completed") {
        contractStatus = "active";
      } else if (submission.status === "expired") {
        contractStatus = "expired";
      } else if (submission.status === "declined") {
        contractStatus = "terminated";
      }

      // Fetch documents for this submission
      let documentUrl: string | null = null;
      let documentName: string | null = null;
      
      try {
        const docsResponse = await fetch(`${docusealUrl}/api/submissions/${submission.id}/documents`, {
          headers: {
            "X-Auth-Token": DOCUSEAL_API_KEY,
            "Content-Type": "application/json",
          },
        });
        
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          console.log(`Docs API response for ${submission.id}:`, JSON.stringify(docsData));
          
          // Handle array or object with documents key
          const documents: DocuSealDocument[] = Array.isArray(docsData) 
            ? docsData 
            : (docsData?.documents || docsData?.data || []);
          
          console.log(`Submission ${submission.id} has ${documents.length} documents`);
          
          if (documents.length > 0) {
            documentUrl = documents[0].url;
            documentName = documents[0].name;
            console.log(`Document URL for ${submission.id}: ${documentUrl}`);
          }
        } else {
          const errorText = await docsResponse.text();
          console.log(`Failed to fetch documents for submission ${submission.id}: ${docsResponse.status} - ${errorText}`);
        }
      } catch (docError) {
        console.error(`Error fetching documents for submission ${submission.id}:`, docError);
      }

      // Determine contract type from folder_name if available
      let contractType = "General";
      const folderName = submission.template?.folder_name?.toLowerCase() || "";
      if (folderName.includes("hr") || folderName.includes("human")) {
        contractType = "HR";
      } else if (folderName.includes("business") || folderName.includes("commercial")) {
        contractType = "Business";
      } else if (folderName.includes("nda") || folderName.includes("confidential")) {
        contractType = "NDA";
      }

      // AI Analysis for new contracts with PDF URLs
      let aiAnalysis: AIAnalysisResult | null = null;
      const isNewContract = !existingDocusealIds.has(submission.id.toString());
      
      if (isNewContract && documentUrl && LOVABLE_API_KEY) {
        console.log(`Analyzing contract ${submission.id} with AI...`);
        aiAnalysis = await analyzeContractWithAI(
          documentUrl,
          documentName || `contract-${submission.id}.pdf`,
          LOVABLE_API_KEY,
          entities || []
        );
        if (aiAnalysis) {
          console.log(`AI analysis complete for ${submission.id}:`, JSON.stringify(aiAnalysis));
        }
      }

      const contractData = {
        title: aiAnalysis?.title || submission.template?.name || `DocuSeal Contract #${submission.id}`,
        type: aiAnalysis?.contract_type || contractType,
        parties: aiAnalysis?.parties || parties,
        status: contractStatus,
        start_date: aiAnalysis?.start_date || (submission.completed_at ? submission.completed_at.split("T")[0] : null),
        end_date: aiAnalysis?.end_date || null,
        docuseal_id: submission.id.toString(),
        docuseal_status: submission.status,
        docuseal_synced_at: new Date().toISOString(),
        file_path: documentUrl,
        file_name: documentName,
        ai_summary: aiAnalysis?.summary || null,
        summary_generated_at: aiAnalysis?.summary ? new Date().toISOString() : null,
      };

      if (existingDocusealIds.has(submission.id.toString())) {
        // Update existing contract
        const existing = existingContracts?.find(
          (c) => c.docuseal_id === submission.id.toString()
        );
        if (existing) {
          const updateData: Record<string, unknown> = {
            status: contractStatus,
            docuseal_status: submission.status,
            docuseal_synced_at: new Date().toISOString(),
            parties,
            type: contractType,
          };
          
          // Only update file info if we have it
          if (documentUrl) {
            updateData.file_path = documentUrl;
            updateData.file_name = documentName;
          }
          
          const { error: updateError } = await supabase
            .from("contracts")
            .update(updateData)
            .eq("id", existing.id);

          if (!updateError) {
            updatedContracts.push(existing.id);
          }
        }
      } else {
        newContracts.push(contractData);
      }
    }

    // Insert new contracts
    let insertedCount = 0;
    if (newContracts.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("contracts")
        .insert(newContracts)
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        insertedCount = inserted?.length || 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        fetched: submissions.length,
        inserted: insertedCount,
        updated: updatedContracts.length,
        analyzed: newContracts.filter(c => c.ai_summary).length,
        message: `Synced ${insertedCount} new contracts (${newContracts.filter(c => c.ai_summary).length} analyzed), updated ${updatedContracts.length} existing contracts`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});