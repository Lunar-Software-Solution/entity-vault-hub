import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ShareholderEntityAffiliationsManager from "./ShareholderEntityAffiliationsManager";
import GravatarAvatar from "@/components/shared/GravatarAvatar";
import AvatarEditDialog from "@/components/shared/AvatarEditDialog";
import IdDocumentsManager, { IdDocument, ExtractedPersonData } from "@/components/shared/IdDocumentsManager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [idDocuments, setIdDocuments] = useState<IdDocument[]>([]);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [extractedPersonData, setExtractedPersonData] = useState<ExtractedPersonData | null>(null);
  const [showPersonDataDialog, setShowPersonDataDialog] = useState(false);
  const queryClient = useQueryClient();
  
  // Use existing ID or generate a temporary one for new shareholders (for file uploads)
  const [tempId] = useState(() => item?.id || crypto.randomUUID());
  const recordId = item?.id || tempId;

  const handleAvatarChange = (newUrl: string | null, deleted: boolean) => {
    if (deleted) {
      setAvatarDeleted(true);
      setEnrichedAvatarUrl(null);
    } else if (newUrl) {
      setEnrichedAvatarUrl(newUrl);
      setAvatarDeleted(false);
    }
  };

  // Fetch existing ID documents for this shareholder
  const { data: existingIdDocs } = useQuery({
    queryKey: ["shareholder-id-documents", item?.id],
    queryFn: async () => {
      if (!item?.id) return [];
      const { data, error } = await supabase
        .from("shareholder_id_documents")
        .select("*")
        .eq("shareholder_id", item.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!item?.id,
  });

  // Initialize ID documents from fetched data
  useEffect(() => {
    if (existingIdDocs) {
      setIdDocuments(existingIdDocs.map((doc: any) => ({
        id: doc.id,
        document_type: doc.document_type || "",
        document_number: doc.document_number || "",
        expiry_date: doc.expiry_date || "",
        file_path: doc.file_path || "",
        file_name: doc.file_name || "",
        notes: doc.notes || "",
      })));
    }
  }, [existingIdDocs]);
  
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

  // Save ID documents to database
  const saveIdDocuments = async (shareholderId: string) => {
    // Delete removed documents
    if (existingIdDocs) {
      const currentIds = idDocuments.filter(d => d.id).map(d => d.id);
      const toDelete = existingIdDocs.filter((d: any) => !currentIds.includes(d.id));
      for (const doc of toDelete) {
        await supabase.from("shareholder_id_documents").delete().eq("id", doc.id);
      }
    }

    // Upsert documents
    for (const doc of idDocuments) {
      if (!doc.document_type) continue; // Skip incomplete docs
      
      const docData = {
        shareholder_id: shareholderId,
        document_type: doc.document_type,
        document_number: doc.document_number || null,
        expiry_date: doc.expiry_date || null,
        file_path: doc.file_path || null,
        file_name: doc.file_name || null,
        notes: doc.notes || null,
      };

      if (doc.id) {
        await supabase.from("shareholder_id_documents").update(docData).eq("id", doc.id);
      } else {
        await supabase.from("shareholder_id_documents").insert(docData);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["shareholder-id-documents", shareholderId] });
  };

  const handleSubmit = async (data: ShareholderFormData) => {
    // Pass idDocuments and tempId along with the form data
    // The parent component will handle saving ID documents after the shareholder is created
    onSubmit({
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      linkedin_url: data.linkedin_url || null,
      address: data.address || null,
      tax_id: data.tax_id || null,
      bio: data.bio || null,
      notes: data.notes || null,
      // Include ID documents and temp ID for new shareholders
      _idDocuments: idDocuments,
      _tempId: item?.id ? null : tempId,
    } as any);

    // If editing existing shareholder, save ID documents
    if (item?.id) {
      await saveIdDocuments(item.id);
    }
  };

  const currentEntityName = entities.find(e => e.id === form.watch("entity_id"))?.name;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col max-h-[75vh]">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
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
            <div className="relative mt-6 group cursor-pointer" onClick={() => setShowAvatarDialog(true)}>
              <GravatarAvatar
                key={`avatar-${avatarDeleted ? 'deleted' : 'active'}-${enrichedAvatarUrl || ''}`}
                email={email}
                name={name || ""}
                size="xl"
                linkedinUrl={linkedinUrl}
                storedAvatarUrl={avatarDeleted ? null : (enrichedAvatarUrl || item?.avatar_url)}
                suppressAvatar={avatarDeleted || item?.suppress_avatar}
                enableEnrichment={false}
              />
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil className="h-5 w-5 text-white" />
              </div>
            </div>

            <AvatarEditDialog
              open={showAvatarDialog}
              onOpenChange={setShowAvatarDialog}
              name={name || ""}
              email={email}
              linkedinUrl={linkedinUrl}
              currentAvatarUrl={avatarDeleted ? null : (enrichedAvatarUrl || item?.avatar_url)}
              recordId={item?.id}
              tableName="shareholders"
              onAvatarChange={handleAvatarChange}
            />
            <div className="flex-1 grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
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
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl><Textarea rows={2} placeholder="Professional bio..." {...field} /></FormControl>
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
          </div>

          {/* ID Documents - always show, use tempId for new shareholders */}
          <IdDocumentsManager
            recordId={recordId}
            documents={idDocuments}
            onChange={setIdDocuments}
            storageFolder="shareholders"
            onPersonDataExtracted={(data) => {
              // Check if any fields would benefit from the extracted data
              const name = form.getValues("name");
              const address = form.getValues("address");
              
              if ((!name && data.holder_name) || (!address && data.holder_address)) {
                setExtractedPersonData(data);
                setShowPersonDataDialog(true);
              }
            }}
          />

          {/* Entity Affiliations - for new shareholders only */}
          {!item?.id && (
            <ShareholderEntityAffiliationsManager
              shareholderId={null}
              currentEntityId={form.watch("entity_id")}
              currentEntityName={currentEntityName}
            />
          )}
        </div>

        {/* Fixed action buttons at bottom */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2 flex-shrink-0">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{item ? "Update" : "Create"}</Button>
        </div>
      </form>

      {/* Dialog to apply extracted person data */}
      <AlertDialog open={showPersonDataDialog} onOpenChange={setShowPersonDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Extracted Information?</AlertDialogTitle>
            <AlertDialogDescription>
              The AI extracted the following information from the ID document. Would you like to fill in the empty fields?
              <div className="mt-3 space-y-2 text-sm">
                {extractedPersonData?.holder_name && !form.getValues("name") && (
                  <div><strong>Name:</strong> {extractedPersonData.holder_name}</div>
                )}
                {extractedPersonData?.holder_address && !form.getValues("address") && (
                  <div><strong>Address:</strong> {extractedPersonData.holder_address}</div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Skip</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (extractedPersonData) {
                let fieldsUpdated = 0;
                if (extractedPersonData.holder_name && !form.getValues("name")) {
                  form.setValue("name", extractedPersonData.holder_name);
                  fieldsUpdated++;
                }
                if (extractedPersonData.holder_address && !form.getValues("address")) {
                  form.setValue("address", extractedPersonData.holder_address);
                  fieldsUpdated++;
                }
                if (fieldsUpdated > 0) {
                  toast.success(`Applied ${fieldsUpdated} field${fieldsUpdated > 1 ? "s" : ""} from ID document`);
                }
              }
              setExtractedPersonData(null);
            }}>
              Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
};

export default ShareholderForm;
