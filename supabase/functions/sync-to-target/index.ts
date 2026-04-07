import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tables in dependency order (parents first)
const TABLES = [
  "entities",
  "document_types",
  "filing_types",
  "software_catalog",
  "issuing_authorities",
  "mail_servers",
  "addresses",
  "address_entity_links",
  "bank_accounts",
  "credit_cards",
  "contracts",
  "contract_entity_links",
  "entity_documents",
  "entity_filings",
  "filing_documents",
  "filing_tasks",
  "filing_task_documents",
  "entity_emails",
  "email_addresses",
  "email_entity_links",
  "entity_websites",
  "entity_software",
  "entity_provider_contracts",
  "directors_ubos",
  "director_entity_links",
  "director_id_documents",
  "advisors",
  "auditors",
  "accountant_firms",
  "consultants",
  "tax_ids",
  "phone_numbers",
  "phone_number_entity_links",
  "social_media_accounts",
  "registration_agents",
  "law_firms",
  "merchant_accounts",
  "share_classes",
  "shareholders",
  "shareholder_entity_links",
  "equity_transactions",
  "inbound_document_queue",
  "user_profiles",
  "user_roles",
  "team_invitations",
  "api_keys",
  "audit_logs",
  "email_2fa_codes",
  "trusted_devices",
];

const STORAGE_BUCKETS = [
  "contract-files",
  "entity-documents",
  "id-documents",
  "avatars",
  "feedback-screenshots",
  "task-documents",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sourceUrl = Deno.env.get("SUPABASE_URL")!;
    const sourceServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sourceAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const targetUrl = Deno.env.get("TARGET_SUPABASE_URL");
    const targetKey = Deno.env.get("TARGET_SUPABASE_SECRET_KEY");

    if (!targetUrl || !targetKey) {
      return new Response(
        JSON.stringify({ error: "Target credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth: accept user JWT or apikey matching service role
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey");
    const isServiceRole = apiKey === sourceServiceKey;

    if (!isServiceRole) {
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const authClient = createClient(sourceUrl, sourceAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await authClient.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const source = createClient(sourceUrl, sourceServiceKey);
    const target = createClient(targetUrl, targetKey);

    const log: string[] = [];
    const errors: string[] = [];

    // === SYNC TABLES ===
    // Delete in reverse order (children first)
    for (const table of [...TABLES].reverse()) {
      try {
        const { error } = await target.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
          // Table might not exist in target — that's ok for optional tables
          log.push(`⚠️ Could not clear ${table}: ${error.message}`);
        } else {
          log.push(`🗑️ Cleared ${table}`);
        }
      } catch (e) {
        log.push(`⚠️ Skip clear ${table}: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }

    // Insert in order (parents first)
    for (const table of TABLES) {
      try {
        // Fetch all rows (handle >1000 with pagination)
        let allRows: Record<string, unknown>[] = [];
        let from = 0;
        const pageSize = 500;

        while (true) {
          const { data, error } = await source
            .from(table)
            .select("*")
            .range(from, from + pageSize - 1);

          if (error) {
            errors.push(`❌ Read ${table}: ${error.message}`);
            break;
          }
          if (!data || data.length === 0) break;
          allRows = allRows.concat(data);
          if (data.length < pageSize) break;
          from += pageSize;
        }

        if (allRows.length === 0) {
          log.push(`⏭️ ${table}: 0 rows`);
          continue;
        }

        // Insert in batches
        const batchSize = 100;
        let inserted = 0;
        for (let i = 0; i < allRows.length; i += batchSize) {
          const batch = allRows.slice(i, i + batchSize);
          const { error: insertError } = await target.from(table).insert(batch as Record<string, unknown>[]);
          if (insertError) {
            errors.push(`❌ Insert ${table} batch ${i}: ${insertError.message}`);
          } else {
            inserted += batch.length;
          }
        }
        log.push(`✅ ${table}: ${inserted}/${allRows.length} rows`);
      } catch (e) {
        errors.push(`❌ ${table}: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }

    // === SYNC STORAGE ===
    for (const bucket of STORAGE_BUCKETS) {
      try {
        const { data: files, error: listError } = await source.storage
          .from(bucket)
          .list("", { limit: 10000 });

        if (listError || !files) {
          log.push(`⚠️ Storage ${bucket}: ${listError?.message || "no files"}`);
          continue;
        }

        // Recursively list all files
        const allFiles = await listAllFiles(source, bucket, "");
        let synced = 0;

        for (const filePath of allFiles) {
          try {
            const { data: fileData, error: dlError } = await source.storage
              .from(bucket)
              .download(filePath);

            if (dlError || !fileData) continue;

            const arrayBuffer = await fileData.arrayBuffer();
            const { error: upError } = await target.storage
              .from(bucket)
              .upload(filePath, arrayBuffer, {
                contentType: fileData.type || "application/octet-stream",
                upsert: true,
              });

            if (!upError) synced++;
          } catch {
            // Skip individual file errors
          }
        }
        log.push(`📁 Storage ${bucket}: ${synced}/${allFiles.length} files`);
      } catch (e) {
        errors.push(`❌ Storage ${bucket}: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        summary: {
          tables: TABLES.length,
          buckets: STORAGE_BUCKETS.length,
          errors: errors.length,
        },
        log,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function listAllFiles(
  client: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string
): Promise<string[]> {
  const paths: string[] = [];
  const { data, error } = await client.storage
    .from(bucket)
    .list(prefix, { limit: 10000 });

  if (error || !data) return paths;

  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) {
      // It's a file
      paths.push(fullPath);
    } else {
      // It's a folder — recurse
      const subFiles = await listAllFiles(client, bucket, fullPath);
      paths.push(...subFiles);
    }
  }
  return paths;
}
