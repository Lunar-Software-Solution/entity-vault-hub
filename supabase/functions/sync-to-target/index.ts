import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TABLES = [
  "entities", "document_types", "filing_types", "software_catalog", "issuing_authorities",
  "mail_servers", "addresses", "address_entity_links", "bank_accounts", "credit_cards",
  "contracts", "contract_entity_links", "entity_documents", "entity_filings",
  "filing_documents", "filing_tasks", "filing_task_documents", "entity_emails",
  "email_addresses", "email_entity_links", "entity_websites", "entity_software",
  "entity_provider_contracts", "directors_ubos", "director_entity_links",
  "director_id_documents", "advisors", "auditors", "accountant_firms", "consultants",
  "tax_ids", "phone_numbers", "phone_number_entity_links", "social_media_accounts",
  "registration_agents", "law_firms", "merchant_accounts", "share_classes",
  "shareholders", "shareholder_entity_links", "equity_transactions",
  "inbound_document_queue", "user_profiles", "user_roles", "team_invitations",
  "api_keys", "audit_logs", "email_2fa_codes", "trusted_devices",
];

const STORAGE_BUCKETS = [
  "contract-files", "entity-documents", "id-documents",
  "avatars", "feedback-screenshots", "task-documents",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sourceUrl = Deno.env.get("SUPABASE_URL")!;
    const sourceServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const targetUrl = Deno.env.get("TARGET_SUPABASE_URL");
    const targetKey = Deno.env.get("TARGET_SUPABASE_SECRET_KEY");

    if (!targetUrl || !targetKey) {
      return new Response(
        JSON.stringify({ error: "Target credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth: require valid JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sourceAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(sourceUrl, sourceAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const source = createClient(sourceUrl, sourceServiceKey);
    const target = createClient(targetUrl, targetKey);

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list"; // list | clear_table | sync_table | sync_bucket

    // LIST: return all tables and buckets to process
    if (action === "list") {
      return json({ tables: TABLES, buckets: STORAGE_BUCKETS });
    }

    // CLEAR_TABLE: delete all rows from a target table
    if (action === "clear_table") {
      const { table } = body;
      const { error } = await target.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      return json({ table, cleared: !error, error: error?.message });
    }

    // SYNC_TABLE: read from source, insert into target
    if (action === "sync_table") {
      const { table } = body;
      let allRows: Record<string, unknown>[] = [];
      let from = 0;
      const pageSize = 500;

      while (true) {
        const { data, error } = await source.from(table).select("*").range(from, from + pageSize - 1);
        if (error) return json({ table, error: error.message });
        if (!data || data.length === 0) break;
        allRows = allRows.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      if (allRows.length === 0) return json({ table, rows: 0 });

      let inserted = 0;
      const errors: string[] = [];
      const batchSize = 100;
      for (let i = 0; i < allRows.length; i += batchSize) {
        const batch = allRows.slice(i, i + batchSize);
        const { error } = await target.from(table).insert(batch as Record<string, unknown>[]);
        if (error) {
          console.error(`Insert error for ${table}:`, error.message, error.details, error.hint);
          errors.push(error.message);
        }
        else inserted += batch.length;
      }

      return json({ table, rows: allRows.length, inserted, errors });
    }

    // SYNC_BUCKET: copy all files from a storage bucket
    if (action === "sync_bucket") {
      const { bucket } = body;
      const allFiles = await listAllFiles(source, bucket, "");
      let synced = 0;
      const errors: string[] = [];

      for (const filePath of allFiles) {
        try {
          const { data, error: dlErr } = await source.storage.from(bucket).download(filePath);
          if (dlErr || !data) { errors.push(`dl:${filePath}`); continue; }
          const buf = await data.arrayBuffer();
          const { error: upErr } = await target.storage.from(bucket).upload(filePath, buf, {
            contentType: data.type || "application/octet-stream", upsert: true,
          });
          if (upErr) errors.push(`up:${filePath}:${upErr.message}`);
          else synced++;
        } catch (e) {
          errors.push(`${filePath}:${e instanceof Error ? e.message : "unknown"}`);
        }
      }

      return json({ bucket, totalFiles: allFiles.length, synced, errors });
    }

    return json({ error: "Unknown action. Use: list, clear_table, sync_table, sync_bucket" }, 400);
  } catch (error) {
    console.error("Sync error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function listAllFiles(
  client: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string
): Promise<string[]> {
  const paths: string[] = [];
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 10000 });
  if (error || !data) return paths;
  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) paths.push(fullPath);
    else paths.push(...await listAllFiles(client, bucket, fullPath));
  }
  return paths;
}
