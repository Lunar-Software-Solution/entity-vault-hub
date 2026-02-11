import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// All readable resources
const RESOURCES = [
  "entities", "bank_accounts", "credit_cards", "addresses", "contracts",
  "phone_numbers", "tax_ids", "email_addresses", "directors_ubos",
  "entity_documents", "entity_filings", "filing_tasks", "entity_websites",
  "entity_software", "social_media_accounts", "accountant_firms", "law_firms",
  "registration_agents", "advisors", "consultants", "auditors",
  "merchant_accounts", "share_classes", "shareholders", "equity_transactions",
  "document_types", "filing_types", "tax_id_types", "issuing_authorities",
];

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function validateApiKey(apiKey: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const keyHash = await hashKey(apiKey);

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  // Update last_used_at
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return data;
}

function parseRoute(pathname: string): { resource: string; id?: string } | null {
  // Expected: /public-api/v1/{resource} or /public-api/v1/{resource}/{id}
  const parts = pathname.split("/").filter(Boolean);
  // parts: ["public-api", "v1", resource, id?]
  if (parts.length < 3) return null;
  const resource = parts[2];
  const id = parts[3] || undefined;
  if (!RESOURCES.includes(resource)) return null;
  return { resource, id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. This API is read-only." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Auth via X-API-Key header
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing X-API-Key header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keyRecord = await validateApiKey(apiKey);
    if (!keyRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const route = parseRoute(url.pathname);

    // Root: list available resources
    if (!route) {
      return new Response(
        JSON.stringify({
          api: "Entity Vault API",
          version: "v1",
          resources: RESOURCES.map((r) => ({
            name: r,
            endpoint: `/public-api/v1/${r}`,
          })),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { resource, id } = route;

    // Parse query params
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 1000);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const orderBy = url.searchParams.get("order_by") || "created_at";
    const orderDir = url.searchParams.get("order") === "asc" ? true : false;
    const entityId = url.searchParams.get("entity_id");

    if (id) {
      // Single resource
      const { data, error } = await supabase
        .from(resource)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "Not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // List resources
    let query = supabase.from(resource).select("*", { count: "exact" });

    // Filter by entity_id if provided and column exists
    if (entityId) {
      query = query.eq("entity_id", entityId);
    }

    query = query.order(orderBy, { ascending: orderDir }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        data,
        pagination: {
          total: count,
          limit,
          offset,
          has_more: (count || 0) > offset + limit,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
