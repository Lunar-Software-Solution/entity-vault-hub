import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import CopyButton from "@/components/shared/CopyButton";
import { Plus, Trash2, Key, BookOpen, Download, FileJson, FileText, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";

const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-api/v1`;

const RESOURCES = [
  { name: "entities", description: "Legal entities (LLCs, Corps, etc.)", filterable: false },
  { name: "bank_accounts", description: "Bank accounts linked to entities", filterable: true },
  { name: "credit_cards", description: "Credit cards linked to entities", filterable: true },
  { name: "addresses", description: "Physical addresses", filterable: true },
  { name: "contracts", description: "Contracts and agreements", filterable: true },
  { name: "phone_numbers", description: "Phone numbers", filterable: true },
  { name: "tax_ids", description: "Tax identification numbers", filterable: true },
  { name: "email_addresses", description: "Email addresses", filterable: true },
  { name: "directors_ubos", description: "Directors and UBOs", filterable: true },
  { name: "entity_documents", description: "Entity documents", filterable: true },
  { name: "entity_filings", description: "Filing records", filterable: true },
  { name: "filing_tasks", description: "Filing tasks and reminders", filterable: true },
  { name: "entity_websites", description: "Websites", filterable: true },
  { name: "entity_software", description: "Software subscriptions", filterable: true },
  { name: "social_media_accounts", description: "Social media accounts", filterable: true },
  { name: "accountant_firms", description: "Accountant firms", filterable: true },
  { name: "law_firms", description: "Law firms", filterable: true },
  { name: "registration_agents", description: "Registered agents", filterable: true },
  { name: "advisors", description: "Advisors", filterable: true },
  { name: "consultants", description: "Consultants", filterable: true },
  { name: "auditors", description: "Auditors", filterable: true },
  { name: "merchant_accounts", description: "Merchant / payment accounts", filterable: true },
  { name: "share_classes", description: "Share classes (cap table)", filterable: true },
  { name: "shareholders", description: "Shareholders (cap table)", filterable: true },
  { name: "equity_transactions", description: "Equity transactions", filterable: true },
  { name: "document_types", description: "Document type definitions", filterable: false },
  { name: "filing_types", description: "Filing type definitions", filterable: false },
  { name: "tax_id_types", description: "Tax ID type definitions", filterable: false },
  { name: "issuing_authorities", description: "Issuing authority definitions", filterable: false },
];

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const generateApiDocsJson = () => {
  const docs = {
    openapi: "3.0.0",
    info: {
      title: "Entity Vault API",
      version: "1.0.0",
      description: "Read-only REST API for accessing entity management data.",
    },
    servers: [{ url: API_BASE_URL }],
    security: [{ ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
      },
    },
    paths: Object.fromEntries(
      RESOURCES.map((r) => [
        `/${r.name}`,
        {
          get: {
            summary: `List ${r.name}`,
            description: r.description,
            parameters: [
              { name: "limit", in: "query", schema: { type: "integer", default: 100, maximum: 1000 } },
              { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
              { name: "order_by", in: "query", schema: { type: "string", default: "created_at" } },
              { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
              ...(r.filterable ? [{ name: "entity_id", in: "query", schema: { type: "string", format: "uuid" }, description: "Filter by entity" }] : []),
            ],
            responses: { "200": { description: "Success" }, "401": { description: "Unauthorized" } },
          },
        },
      ])
    ),
  };
  return docs;
};

const generateApiDocsMd = () => {
  let md = `# Entity Vault API Documentation\n\n`;
  md += `## Base URL\n\n\`\`\`\n${API_BASE_URL}\n\`\`\`\n\n`;
  md += `## Authentication\n\nAll requests require an \`X-API-Key\` header:\n\n\`\`\`bash\ncurl -H "X-API-Key: your_api_key_here" ${API_BASE_URL}/entities\n\`\`\`\n\n`;
  md += `## Pagination\n\nAll list endpoints support:\n\n| Parameter | Type | Default | Description |\n|-----------|------|---------|-------------|\n| \`limit\` | integer | 100 | Max items (up to 1000) |\n| \`offset\` | integer | 0 | Skip N items |\n| \`order_by\` | string | created_at | Sort column |\n| \`order\` | string | desc | Sort direction (asc/desc) |\n| \`entity_id\` | uuid | — | Filter by entity (where applicable) |\n\n`;
  md += `## Response Format\n\n\`\`\`json\n{\n  "data": [...],\n  "pagination": {\n    "total": 42,\n    "limit": 100,\n    "offset": 0,\n    "has_more": false\n  }\n}\n\`\`\`\n\n`;
  md += `## Single Resource\n\nAppend \`/{id}\` to any endpoint:\n\n\`\`\`bash\nGET ${API_BASE_URL}/entities/{uuid}\n\`\`\`\n\nReturns:\n\`\`\`json\n{ "data": { ... } }\n\`\`\`\n\n`;
  md += `## Endpoints\n\n`;
  md += `| Endpoint | Description | Entity Filter |\n|----------|-------------|---------------|\n`;
  RESOURCES.forEach((r) => {
    md += `| \`GET /${r.name}\` | ${r.description} | ${r.filterable ? "✅" : "—"} |\n`;
  });
  md += `\n## Error Responses\n\n| Status | Description |\n|--------|-------------|\n| 401 | Missing or invalid API key |\n| 404 | Resource not found |\n| 405 | Method not allowed (only GET) |\n| 400 | Bad request |\n| 500 | Internal server error |\n`;
  return md;
};

const ApiSection = () => {
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<any>(null);

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["api_keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate a random API key
      const rawKey = `evk_${crypto.randomUUID().replace(/-/g, "")}`;
      const keyHash = await hashKey(rawKey);
      const keyPrefix = rawKey.substring(0, 12);

      const { error } = await supabase.from("api_keys").insert({
        user_id: user.id,
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
      });

      if (error) throw error;
      return rawKey;
    },
    onSuccess: (key) => {
      setCreatedKey(key);
      setNewKeyName("");
      queryClient.invalidateQueries({ queryKey: ["api_keys"] });
      toast.success("API key created");
    },
    onError: () => toast.error("Failed to create API key"),
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api_keys"] });
      setDeletingKey(null);
      toast.success("API key deleted");
    },
    onError: () => toast.error("Failed to delete API key"),
  });

  const downloadJson = () => {
    const docs = generateApiDocsJson();
    const blob = new Blob([JSON.stringify(docs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "entity-vault-api-docs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMd = () => {
    const md = generateApiDocsMd();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "entity-vault-api-docs.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="docs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="docs" className="gap-1">
            <BookOpen className="w-4 h-4" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="keys" className="gap-1">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">API Reference</h3>
              <p className="text-sm text-muted-foreground">Read-only REST API for accessing your entity data programmatically.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadJson} className="gap-2 text-foreground">
                <FileJson className="w-4 h-4" />
                OpenAPI JSON
              </Button>
              <Button variant="outline" size="sm" onClick={downloadMd} className="gap-2 text-foreground">
                <FileText className="w-4 h-4" />
                Markdown
              </Button>
            </div>
          </div>

          {/* Base URL */}
          <div className="glass-card rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Base URL</h4>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 font-mono text-sm">
              <code className="flex-1 text-primary break-all">{API_BASE_URL}</code>
              <CopyButton value={API_BASE_URL} label="Base URL" />
            </div>
          </div>

          {/* Authentication */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Authentication</h4>
            <p className="text-sm text-muted-foreground">Include your API key in the <code className="text-primary">X-API-Key</code> header:</p>
            <div className="bg-muted/50 rounded-lg px-3 py-2 font-mono text-xs overflow-x-auto">
              <pre className="text-muted-foreground">
{`curl -H "X-API-Key: evk_your_key_here" \\
  ${API_BASE_URL}/entities`}
              </pre>
            </div>
          </div>

          {/* Pagination */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Pagination & Filtering</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-mono text-xs text-foreground">limit</TableCell><TableCell className="text-foreground">integer</TableCell><TableCell className="text-foreground">100</TableCell><TableCell className="text-foreground">Max items per page (up to 1000)</TableCell></TableRow>
                <TableRow><TableCell className="font-mono text-xs text-foreground">offset</TableCell><TableCell className="text-foreground">integer</TableCell><TableCell className="text-foreground">0</TableCell><TableCell className="text-foreground">Number of items to skip</TableCell></TableRow>
                <TableRow><TableCell className="font-mono text-xs text-foreground">order_by</TableCell><TableCell className="text-foreground">string</TableCell><TableCell className="text-foreground">created_at</TableCell><TableCell className="text-foreground">Column to sort by</TableCell></TableRow>
                <TableRow><TableCell className="font-mono text-xs text-foreground">order</TableCell><TableCell className="text-foreground">string</TableCell><TableCell className="text-foreground">desc</TableCell><TableCell className="text-foreground">Sort direction (asc or desc)</TableCell></TableRow>
                <TableRow><TableCell className="font-mono text-xs text-foreground">entity_id</TableCell><TableCell className="text-foreground">uuid</TableCell><TableCell className="text-foreground">—</TableCell><TableCell className="text-foreground">Filter results by entity (where applicable)</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Endpoints */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Available Endpoints</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Entity Filter</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RESOURCES.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>
                      <code className="text-xs font-mono text-primary">GET /{r.name}</code>
                    </TableCell>
                    <TableCell className="text-sm">{r.description}</TableCell>
                    <TableCell className="text-center">
                      {r.filterable ? (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 text-xs">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Response format */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Response Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">List response:</p>
                <div className="bg-muted/50 rounded-lg px-3 py-2 font-mono text-xs">
                  <pre className="text-muted-foreground whitespace-pre-wrap">{`{
  "data": [...],
  "pagination": {
    "total": 42,
    "limit": 100,
    "offset": 0,
    "has_more": false
  }
}`}</pre>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Single item (<code className="text-primary">GET /{'{resource}'}/{'{id}'}</code>):</p>
                <div className="bg-muted/50 rounded-lg px-3 py-2 font-mono text-xs">
                  <pre className="text-muted-foreground whitespace-pre-wrap">{`{
  "data": { ... }
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Error codes */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Error Responses</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-mono">401</TableCell><TableCell>Missing or invalid API key</TableCell></TableRow>
                <TableRow><TableCell className="font-mono">404</TableCell><TableCell>Resource not found</TableCell></TableRow>
                <TableRow><TableCell className="font-mono">405</TableCell><TableCell>Method not allowed (only GET supported)</TableCell></TableRow>
                <TableRow><TableCell className="font-mono">400</TableCell><TableCell>Bad request / invalid parameters</TableCell></TableRow>
                <TableRow><TableCell className="font-mono">500</TableCell><TableCell>Internal server error</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
              <p className="text-sm text-muted-foreground">Manage API keys for programmatic access.</p>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Key
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>
          ) : !apiKeys?.length ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Key className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No API keys created yet.</p>
              {isAdmin && <p className="text-xs text-muted-foreground mt-1">Create one to start using the API.</p>}
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="w-12" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key: any) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{key.key_prefix}...</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(key.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.last_used_at ? format(new Date(key.last_used_at), "MMM d, yyyy HH:mm") : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={key.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingKey(key)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={() => { setShowCreateDialog(false); setCreatedKey(null); setNewKeyName(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{createdKey ? "API Key Created" : "Create API Key"}</DialogTitle>
          </DialogHeader>
          {createdKey ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-400 font-medium">⚠️ Copy this key now. It won't be shown again.</p>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 font-mono text-sm">
                <code className="flex-1 break-all text-foreground">{createdKey}</code>
                <CopyButton value={createdKey} label="API Key" />
              </div>
              <Button className="w-full" onClick={() => { setShowCreateDialog(false); setCreatedKey(null); }}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Key Name</label>
                <Input
                  className="mt-1"
                  placeholder="e.g., Production, Integration"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button
                  disabled={!newKeyName.trim() || createKeyMutation.isPending}
                  onClick={() => createKeyMutation.mutate(newKeyName.trim())}
                >
                  {createKeyMutation.isPending ? "Creating..." : "Create Key"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingKey}
        onOpenChange={() => setDeletingKey(null)}
        onConfirm={() => deletingKey && deleteKeyMutation.mutate(deletingKey.id)}
        title="Delete API Key"
        description={`Are you sure you want to delete "${deletingKey?.name}"? This will immediately revoke access for any systems using this key.`}
        isLoading={deleteKeyMutation.isPending}
      />
    </div>
  );
};

export default ApiSection;
