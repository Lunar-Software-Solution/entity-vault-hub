import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  };
  status: string;
  created_at: string;
  completed_at: string | null;
  documents?: Array<{
    name: string;
    url: string;
  }>;
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

    // Verify user with anon key client
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
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
      throw new Error(`DocuSeal API error: ${response.status}`);
    }

    const submissions: DocuSealSubmission[] = await response.json();
    console.log(`Fetched ${submissions.length} submissions from DocuSeal`);

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

      const contractData = {
        title: submission.template?.name || `DocuSeal Contract #${submission.id}`,
        type: "General",
        parties,
        status: contractStatus,
        start_date: submission.completed_at
          ? submission.completed_at.split("T")[0]
          : null,
        docuseal_id: submission.id.toString(),
        docuseal_status: submission.status,
        docuseal_synced_at: new Date().toISOString(),
      };

      if (existingDocusealIds.has(submission.id.toString())) {
        // Update existing contract
        const existing = existingContracts?.find(
          (c) => c.docuseal_id === submission.id.toString()
        );
        if (existing) {
          const { error: updateError } = await supabase
            .from("contracts")
            .update({
              status: contractStatus,
              docuseal_status: submission.status,
              docuseal_synced_at: new Date().toISOString(),
              parties,
            })
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
        message: `Synced ${insertedCount} new contracts, updated ${updatedContracts.length} existing contracts`,
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
