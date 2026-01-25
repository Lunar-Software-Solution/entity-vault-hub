import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ShareholderEntityAffiliationsManager from "./ShareholderEntityAffiliationsManager";
import GravatarAvatar from "@/components/shared/GravatarAvatar";

interface ShareholderFormData {
  entity_id: string;
  name: string;
  shareholder_type: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  address?: string;
  tax_id?: string;
  is_founder: boolean;
  is_board_member: boolean;
  bio?: string;
  notes?: string;
}

interface ShareholderFormProps {
  item?: any;
  entities: any[];
  onSubmit: (data: ShareholderFormData) => void;
  onCancel: () => void;
}

const ShareholderForm = ({ item, entities, onSubmit, onCancel }: ShareholderFormProps) => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedAvatarUrl, setEnrichedAvatarUrl] = useState<string | null>(null);
  const [avatarDeleted, setAvatarDeleted] = useState(false);
  
  const form = useForm<ShareholderFormData>({
    defaultValues: {
      entity_id: item?.entity_id || "",
      name: item?.name || "",
      shareholder_type: item?.shareholder_type || "individual",
      email: item?.email || "",
      phone: item?.phone || "",
      linkedin_url: item?.linkedin_url || "",
      address: item?.address || "",
      tax_id: item?.tax_id || "",
      is_founder: item?.is_founder || false,
      is_board_member: item?.is_board_member || false,
      bio: item?.bio || "",
      notes: item?.notes || "",
    },
  });

  const email = form.watch("email");
  const name = form.watch("name");
  const linkedinUrl = form.watch("linkedin_url");
  const shareholderTypes = ["individual", "institution", "founder", "employee", "investor"];

  // Enrich profile using Lovable AI
  const handleEnrichProfile = async () => {
    if (!linkedinUrl) {
      toast.error("Please enter a LinkedIn URL first");
      return;
    }

    setIsEnriching(true);
    setAvatarDeleted(false); // Reset deletion flag when re-enriching
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to use profile enrichment");
        return;
      }

      const { data, error } = await supabase.functions.invoke("enrich-profile", {
        body: { 
          email, 
          linkedin_url: linkedinUrl, 
          name,
          record_id: item?.id,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Enrichment error:", error);
        toast.error("Failed to enrich profile");
        return;
      }

      if (data?.success && data?.data) {
        const enriched = data.data;
        let fieldsUpdated = 0;

        if (enriched.avatar_url) {
          setEnrichedAvatarUrl(enriched.avatar_url);
          fieldsUpdated++;
        }
        if (enriched.name && !form.getValues("name")) {
          form.setValue("name", enriched.name);
          fieldsUpdated++;
        }
        if (enriched.email && !form.getValues("email")) {
          form.setValue("email", enriched.email);
          fieldsUpdated++;
        }
        if (enriched.location && !form.getValues("address")) {
          form.setValue("address", enriched.location);
          fieldsUpdated++;
        }
        if (enriched.linkedin_url && !form.getValues("linkedin_url")) {
          form.setValue("linkedin_url", enriched.linkedin_url);
          fieldsUpdated++;
        }
        if (enriched.bio && !form.getValues("bio")) {
          form.setValue("bio", enriched.bio);
          fieldsUpdated++;
        }

        if (fieldsUpdated > 0) {
          toast.success(`Profile enriched! Updated ${fieldsUpdated} field${fieldsUpdated > 1 ? "s" : ""}`);
        } else if (data.fallback) {
          toast.info("AI enrichment unavailable - no additional data found");
        } else {
          toast.info("No new data found to enrich");
        }
      } else if (data?.fallback) {
        toast.info("AI enrichment unavailable at this time");
      } else {
        toast.error("No enrichment data returned");
      }
    } catch (err) {
      console.error("Enrichment failed:", err);
      toast.error("Failed to enrich profile");
    } finally {
      setIsEnriching(false);
    }
  };

  // Handle avatar deletion
  const handleDeleteAvatar = async () => {
    if (!item?.id) {
      toast.error("Cannot delete avatar for unsaved record");
      return;
    }

    try {
      const { error } = await supabase
        .from("shareholders")
        .update({ 
          avatar_url: null, 
          suppress_avatar: true 
        })
        .eq("id", item.id);

      if (error) {
        console.error("Failed to delete avatar:", error);
        toast.error("Failed to delete avatar");
        return;
      }

      setAvatarDeleted(true);
      setEnrichedAvatarUrl(null);
      toast.success("Avatar removed");
    } catch (err) {
      console.error("Error deleting avatar:", err);
      toast.error("Failed to delete avatar");
    }
  };

  const handleSubmit = (data: ShareholderFormData) => {
    onSubmit({
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      linkedin_url: data.linkedin_url || null,
      address: data.address || null,
      tax_id: data.tax_id || null,
      bio: data.bio || null,
      notes: data.notes || null,
    } as any);
  };

  const currentEntityName = entities.find(e => e.id === form.watch("entity_id"))?.name;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Entity Affiliations - shown at top for existing shareholders */}
        {item?.id && (
          <ShareholderEntityAffiliationsManager
            shareholderId={item.id}
            currentEntityId={item.entity_id}
            currentEntityName={currentEntityName}
          />
        )}

        <FormField control={form.control} name="entity_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Entity *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select an entity" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background">
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2 mt-6">
            <GravatarAvatar
              key={`avatar-${avatarDeleted ? 'deleted' : 'active'}`}
              email={email}
              name={name || ""}
              size="2xl"
              linkedinUrl={linkedinUrl}
              storedAvatarUrl={avatarDeleted ? null : (enrichedAvatarUrl || item?.avatar_url)}
              suppressAvatar={avatarDeleted || item?.suppress_avatar}
              enableEnrichment={false}
            />
            {item?.id && (item?.avatar_url || enrichedAvatarUrl) && !avatarDeleted && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDeleteAvatar}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            )}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="shareholder_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background">
                    {shareholderTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input placeholder="+1 555-1234" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="linkedin_url" render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn URL</FormLabel>
            <div className="flex gap-2">
              <FormControl><Input placeholder="https://linkedin.com/in/username" {...field} /></FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleEnrichProfile}
                disabled={isEnriching || !linkedinUrl}
                title="Enrich profile from LinkedIn"
                className="flex-shrink-0"
              >
                {isEnriching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl><Input placeholder="123 Main St, City, State" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="tax_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID / SSN</FormLabel>
            <FormControl><Input placeholder="XXX-XX-XXXX" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex gap-6">
          <FormField control={form.control} name="is_founder" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Founder</FormLabel>
              </div>
            </FormItem>
          )} />
          <FormField control={form.control} name="is_board_member" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Board Member</FormLabel>
              </div>
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="bio" render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl><Textarea rows={2} placeholder="Professional bio or description..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Entity Affiliations - for new shareholders only */}
        {!item?.id && (
          <ShareholderEntityAffiliationsManager
            shareholderId={null}
            currentEntityId={form.watch("entity_id")}
            currentEntityName={currentEntityName}
          />
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{item ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
};

export default ShareholderForm;
