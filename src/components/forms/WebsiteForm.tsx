import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entityWebsiteSchema, EntityWebsiteFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { type EntityWebsite } from "@/hooks/usePortalData";
import WebsiteEntityAffiliationsManager from "./WebsiteEntityAffiliationsManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Globe, RefreshCw, Shield, Server } from "lucide-react";

interface WebsiteFormProps {
  website?: EntityWebsite | null;
  defaultEntityId?: string;
  onSubmit: (data: EntityWebsiteFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface DNSRecord {
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied?: boolean;
}

const websiteTypes = [
  { value: "corporate", label: "Corporate" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "marketing", label: "Marketing" },
  { value: "landing", label: "Landing Page" },
  { value: "blog", label: "Blog" },
  { value: "support", label: "Support Portal" },
  { value: "documentation", label: "Documentation" },
  { value: "app", label: "Web App" },
  { value: "other", label: "Other" },
];

const platforms = [
  { value: "wordpress", label: "WordPress" },
  { value: "shopify", label: "Shopify" },
  { value: "squarespace", label: "Squarespace" },
  { value: "wix", label: "Wix" },
  { value: "webflow", label: "Webflow" },
  { value: "magento", label: "Magento" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "bigcommerce", label: "BigCommerce" },
  { value: "hubspot", label: "HubSpot" },
  { value: "ghost", label: "Ghost" },
  { value: "drupal", label: "Drupal" },
  { value: "joomla", label: "Joomla" },
  { value: "custom", label: "Custom Built" },
  { value: "react", label: "React/Next.js" },
  { value: "vue", label: "Vue/Nuxt" },
  { value: "angular", label: "Angular" },
  { value: "aws", label: "AWS" },
  { value: "vercel", label: "Vercel" },
  { value: "netlify", label: "Netlify" },
  { value: "cloudflare", label: "Cloudflare Pages" },
  { value: "other", label: "Other" },
];

const WebsiteForm = ({ website, defaultEntityId, onSubmit, onCancel, isLoading }: WebsiteFormProps) => {
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [isFetchingDns, setIsFetchingDns] = useState(false);
  const [dnsError, setDnsError] = useState<string | null>(null);
  const [dnsDomain, setDnsDomain] = useState<string | null>(null);

  const form = useForm<EntityWebsiteFormData>({
    resolver: zodResolver(entityWebsiteSchema),
    defaultValues: {
      url: website?.url ?? "",
      name: website?.name ?? "",
      type: website?.type ?? "corporate",
      platform: website?.platform ?? "",
      is_primary: website?.is_primary ?? false,
      is_active: website?.is_active ?? true,
      domain_expiry_date: website?.domain_expiry_date ?? "",
      notes: website?.notes ?? "",
    },
  });

  const fetchDnsRecords = async () => {
    const url = form.getValues("url");
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL first",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingDns(true);
    setDnsError(null);
    setDnsRecords([]);
    setDnsDomain(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke('fetch-cloudflare-dns', {
        body: { domain: url },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        setDnsError(data.details || data.error);
        if (data.records) {
          setDnsRecords(data.records);
        }
      } else {
        setDnsRecords(data.records || []);
        setDnsDomain(data.domain);
        toast({
          title: "DNS Records Fetched",
          description: `Found ${data.records?.length || 0} A/CNAME records for ${data.domain}`,
        });
      }
    } catch (error: unknown) {
      console.error("Error fetching DNS records:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch DNS records";
      setDnsError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsFetchingDns(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Website Name *</FormLabel>
              <FormControl>
                <Input placeholder="Main Website" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem>
              <FormLabel>URL *</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={fetchDnsRecords}
                  disabled={isFetchingDns}
                  title="Fetch DNS Records from Cloudflare"
                >
                  {isFetchingDns ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* DNS Records Display */}
        {(dnsRecords.length > 0 || dnsError) && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  DNS Records {dnsDomain && <span className="text-muted-foreground">({dnsDomain})</span>}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fetchDnsRecords}
                disabled={isFetchingDns}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isFetchingDns ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {dnsError && (
              <p className="text-sm text-destructive">{dnsError}</p>
            )}

            {dnsRecords.length > 0 && (
              <div className="space-y-2">
                {dnsRecords.map((record, index) => (
                  <div
                    key={`${record.name}-${record.type}-${index}`}
                    className="flex items-center gap-2 text-sm bg-background rounded-md p-2 border"
                  >
                    <Badge variant={record.type === 'A' ? 'default' : 'secondary'} className="w-16 justify-center">
                      {record.type}
                    </Badge>
                    <span className="font-mono text-xs flex-1 truncate" title={record.name}>
                      {record.name}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-xs flex-1 truncate" title={record.content}>
                      {record.content}
                    </span>
                    {record.proxied && (
                      <span title="Proxied through Cloudflare">
                        <Shield className="h-3 w-3 text-orange-500" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {dnsRecords.length === 0 && !dnsError && (
              <p className="text-sm text-muted-foreground">No A or CNAME records found</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {websiteTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="platform" render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="domain_expiry_date" render={({ field }) => (
          <FormItem>
            <FormLabel>Domain Expiry Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Additional notes..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="is_primary" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="cursor-pointer">Primary Website</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />

          <FormField control={form.control} name="is_active" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="cursor-pointer">Active</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />
        </div>

        {/* Entity Affiliations Section */}
        <Separator className="my-4" />
        <WebsiteEntityAffiliationsManager websiteId={website?.id || null} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : website ? "Update Website" : "Add Website"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WebsiteForm;
