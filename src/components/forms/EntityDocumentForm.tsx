import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entityDocumentSchema, type EntityDocumentFormData } from "@/lib/formSchemas";
import { useDocumentTypes, useIssuingAuthorities, type EntityDocument } from "@/hooks/usePortalData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocumentFileUpload from "@/components/documents/DocumentFileUpload";
import DocumentSummary from "@/components/documents/DocumentSummary";
import { useState, useMemo } from "react";

interface EntityDocumentFormProps {
  entityId: string;
  document?: EntityDocument | null;
  onSubmit: (data: EntityDocumentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const categoryColors: Record<string, string> = {
  Formation: "bg-blue-500/20 text-blue-400",
  Tax: "bg-orange-500/20 text-orange-400",
  Governance: "bg-purple-500/20 text-purple-400",
  Legal: "bg-green-500/20 text-green-400",
  Other: "bg-zinc-500/20 text-zinc-400",
};

const EntityDocumentForm = ({ entityId, document, onSubmit, onCancel, isLoading }: EntityDocumentFormProps) => {
  const { data: documentTypes } = useDocumentTypes();
  const { data: issuingAuthorities } = useIssuingAuthorities();
  const [documentId] = useState(() => document?.id || crypto.randomUUID());
  const [aiSummary, setAiSummary] = useState<string | null>((document as any)?.ai_summary ?? null);
  const [summaryGeneratedAt, setSummaryGeneratedAt] = useState<string | null>(
    (document as any)?.summary_generated_at ?? null
  );

  const form = useForm<EntityDocumentFormData>({
    resolver: zodResolver(entityDocumentSchema),
    defaultValues: {
      entity_id: entityId,
      document_type_id: document?.document_type_id || "",
      title: document?.title || "",
      file_path: document?.file_path || "",
      file_name: document?.file_name || "",
      issued_date: document?.issued_date || "",
      expiry_date: document?.expiry_date || "",
      issuing_authority: document?.issuing_authority || "",
      reference_number: document?.reference_number || "",
      notes: document?.notes || "",
      status: (document?.status as "current" | "superseded" | "expired") || "current",
    },
  });

  const handleFileUpload = (filePath: string, fileName: string) => {
    form.setValue("file_path", filePath);
    form.setValue("file_name", fileName);
  };

  const handleSummaryGenerated = (summary: string, generatedAt: string) => {
    setAiSummary(summary);
    setSummaryGeneratedAt(generatedAt);
  };

  // Group document types by category
  const groupedTypes = documentTypes?.reduce((acc, type) => {
    const category = type.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {} as Record<string, typeof documentTypes>) || {};

  // Group issuing authorities by country
  const groupedAuthorities = useMemo(() => {
    if (!issuingAuthorities) return {};
    return issuingAuthorities.reduce((acc, auth) => {
      const country = auth.country || "Other";
      if (!acc[country]) acc[country] = [];
      acc[country].push(auth);
      return acc;
    }, {} as Record<string, typeof issuingAuthorities>);
  }, [issuingAuthorities]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="document_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background max-h-[300px]">
                  <SelectItem value="__none__">No type selected</SelectItem>
                  {Object.entries(groupedTypes).map(([category, types]) => (
                    <div key={category}>
                      <div className={`px-2 py-1 text-xs font-semibold ${categoryColors[category] || categoryColors.Other}`}>
                        {category}
                      </div>
                      {types?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.code} - {type.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Delaware Certificate of Formation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Document File</FormLabel>
          <div className="mt-2">
            <DocumentFileUpload
              documentId={documentId}
              existingFilePath={form.watch("file_path")}
              existingFileName={form.watch("file_name")}
              onUploadComplete={handleFileUpload}
              onSummaryGenerated={handleSummaryGenerated}
            />
          </div>
        </div>

        {aiSummary && (
          <DocumentSummary summary={aiSummary} generatedAt={summaryGeneratedAt} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issued_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issued Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="issuing_authority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issuing Authority</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select issuing authority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background max-h-[300px]">
                  <SelectItem value="__none__">No authority selected</SelectItem>
                  {Object.entries(groupedAuthorities)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([country, authorities]) => (
                      <div key={country}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                          {country}
                        </div>
                        {authorities?.map((auth) => (
                          <SelectItem key={auth.id} value={auth.name}>
                            {auth.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Filing number, document ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="superseded">Superseded</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : document ? "Update Document" : "Add Document"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EntityDocumentForm;