import { useState, useMemo } from "react";
import { Cloud, Loader2, Globe, CheckSquare, Square, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useEntities, useEntityWebsites } from "@/hooks/usePortalData";
import { useBulkCreateEntityWebsites } from "@/hooks/usePortalMutations";
import { toast } from "sonner";

interface DnsRecord {
  name: string;
  type: string;
  content: string;
  proxied: boolean;
}

interface CloudflareWebsiteImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CloudflareWebsiteImporter = ({ open, onOpenChange }: CloudflareWebsiteImporterProps) => {
  const [domain, setDomain] = useState("");
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("__none__");
  const [websiteType, setWebsiteType] = useState<string>("other");

  const { data: entities } = useEntities();
  const { data: existingWebsites } = useEntityWebsites();
  const bulkCreate = useBulkCreateEntityWebsites();

  // Filter to only A and CNAME records, exclude wildcards
  const filteredRecords = useMemo(() => {
    return records.filter(
      (r) => (r.type === "A" || r.type === "CNAME") && !r.name.startsWith("*")
    );
  }, [records]);

  // Get existing website URLs for duplicate detection
  const existingUrls = useMemo(() => {
    if (!existingWebsites) return new Set<string>();
    return new Set(existingWebsites.map((w) => w.url.toLowerCase()));
  }, [existingWebsites]);

  // Mark records as duplicate or new
  const recordsWithStatus = useMemo(() => {
    return filteredRecords.map((r) => ({
      ...r,
      isDuplicate: existingUrls.has(`https://${r.name}`.toLowerCase()),
    }));
  }, [filteredRecords, existingUrls]);

  // Available records (non-duplicates)
  const availableRecords = useMemo(() => {
    return recordsWithStatus.filter((r) => !r.isDuplicate);
  }, [recordsWithStatus]);

  const fetchDnsRecords = async () => {
    if (!domain.trim()) {
      setFetchError("Please enter a domain");
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setRecords([]);
    setSelectedRecords(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("fetch-cloudflare-dns", {
        body: { domain: domain.trim() },
      });

      if (error) throw error;

      if (data.error) {
        setFetchError(data.error);
        return;
      }

      setRecords(data.records || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to fetch DNS records");
    } finally {
      setIsFetching(false);
    }
  };

  const toggleRecord = (name: string) => {
    const next = new Set(selectedRecords);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelectedRecords(next);
  };

  const toggleAll = () => {
    if (selectedRecords.size === availableRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(availableRecords.map((r) => r.name)));
    }
  };

  const generateWebsiteName = (recordName: string): string => {
    // Extract subdomain or use domain name
    const parts = recordName.split(".");
    if (parts.length > 2) {
      // Has subdomain - capitalize first segment
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    // Root domain - use the domain name
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  };

  const handleImport = async () => {
    if (selectedRecords.size === 0) {
      toast.error("Please select at least one record to import");
      return;
    }

    const websites = Array.from(selectedRecords).map((name) => ({
      url: `https://${name}`,
      name: generateWebsiteName(name),
      type: websiteType,
      entity_id: selectedEntityId === "__none__" ? null : selectedEntityId,
      is_active: true,
      is_primary: false,
    }));

    bulkCreate.mutate(websites, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setDomain("");
    setRecords([]);
    setSelectedRecords(new Set());
    setFetchError(null);
    setSelectedEntityId("__none__");
    setWebsiteType("other");
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const websiteTypes = [
    { value: "corporate", label: "Corporate" },
    { value: "ecommerce", label: "E-Commerce" },
    { value: "landing", label: "Landing Page" },
    { value: "blog", label: "Blog" },
    { value: "portal", label: "Portal" },
    { value: "documentation", label: "Documentation" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Import Websites from Cloudflare
          </DialogTitle>
          <DialogDescription>
            Enter a domain managed in Cloudflare to discover and import subdomains as website records.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Domain Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cf-domain" className="sr-only">
                Root Domain
              </Label>
              <Input
                id="cf-domain"
                placeholder="Enter root domain (e.g., braxtech.net)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchDnsRecords()}
              />
            </div>
            <Button onClick={fetchDnsRecords} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              <span className="ml-2">Fetch</span>
            </Button>
          </div>

          {/* Error Display */}
          {fetchError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {fetchError}
            </div>
          )}

          {/* Records List */}
          {recordsWithStatus.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Found {recordsWithStatus.length} record(s) • {availableRecords.length} available
                </span>
                {availableRecords.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={toggleAll}>
                    {selectedRecords.size === availableRecords.length ? (
                      <CheckSquare className="h-4 w-4 mr-1" />
                    ) : (
                      <Square className="h-4 w-4 mr-1" />
                    )}
                    {selectedRecords.size === availableRecords.length ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>

              <ScrollArea className="flex-1 max-h-[240px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {recordsWithStatus.map((record) => (
                    <div
                      key={record.name}
                      className={`flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 ${
                        record.isDuplicate ? "opacity-50" : ""
                      }`}
                    >
                      <Checkbox
                        checked={selectedRecords.has(record.name)}
                        onCheckedChange={() => toggleRecord(record.name)}
                        disabled={record.isDuplicate}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{record.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{record.content}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {record.type}
                      </Badge>
                      {record.proxied && (
                        <Badge variant="secondary" className="text-xs">
                          Proxied
                        </Badge>
                      )}
                      {record.isDuplicate && (
                        <Badge variant="destructive" className="text-xs">
                          Exists
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cf-entity">Link to Entity (optional)</Label>
                  <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                    <SelectTrigger id="cf-entity">
                      <SelectValue placeholder="No entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No entity</SelectItem>
                      {entities?.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf-type">Website Type</Label>
                  <Select value={websiteType} onValueChange={setWebsiteType}>
                    <SelectTrigger id="cf-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {websiteTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedRecords.size === 0 || bulkCreate.isPending}
          >
            {bulkCreate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Create {selectedRecords.size} Website{selectedRecords.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloudflareWebsiteImporter;
