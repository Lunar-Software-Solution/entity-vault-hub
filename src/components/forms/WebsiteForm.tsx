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
import { type EntityWebsite } from "@/hooks/usePortalData";
import WebsiteEntityAffiliationsManager from "./WebsiteEntityAffiliationsManager";

interface WebsiteFormProps {
  website?: EntityWebsite | null;
  defaultEntityId?: string;
  onSubmit: (data: EntityWebsiteFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
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
  const form = useForm<EntityWebsiteFormData>({
    resolver: zodResolver(entityWebsiteSchema),
    defaultValues: {
      entity_id: website?.entity_id ?? defaultEntityId ?? "",
      url: website?.url ?? "",
      name: website?.name ?? "",
      type: website?.type ?? "corporate",
      platform: website?.platform ?? "",
      is_primary: website?.is_primary ?? false,
      is_active: website?.is_active ?? true,
      ssl_expiry_date: website?.ssl_expiry_date ?? "",
      domain_expiry_date: website?.domain_expiry_date ?? "",
      notes: website?.notes ?? "",
    },
  });

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
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="ssl_expiry_date" render={({ field }) => (
            <FormItem>
              <FormLabel>SSL Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="domain_expiry_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Domain Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

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
