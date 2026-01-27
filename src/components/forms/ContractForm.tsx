import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractSchema, ContractFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Contract } from "@/hooks/usePortalData";
import { useEntities } from "@/hooks/usePortalData";
import AnalyzeContractUpload, { ExtractedContractData } from "@/components/contracts/AnalyzeContractUpload";
import ContractFileUpload from "@/components/contracts/ContractFileUpload";
import ContractSummary from "@/components/contracts/ContractSummary";

interface ContractFormProps {
  contract?: Contract | null;
  onSubmit: (data: ContractFormData & { file_path?: string; file_name?: string; ai_summary?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ContractForm = ({ contract, onSubmit, onCancel, isLoading }: ContractFormProps) => {
  const { data: entities } = useEntities();
  const [filePath, setFilePath] = useState<string | null>((contract as any)?.file_path ?? null);
  const [fileName, setFileName] = useState<string | null>((contract as any)?.file_name ?? null);
  const [aiSummary, setAiSummary] = useState<string | null>((contract as any)?.ai_summary ?? null);
  const [summaryGeneratedAt, setSummaryGeneratedAt] = useState<string | null>(
    (contract as any)?.summary_generated_at ?? null
  );
  
  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: contract?.title ?? "",
      type: contract?.type ?? "General",
      parties: contract?.parties ?? [],
      status: contract?.status ?? "active",
      start_date: contract?.start_date ?? "",
      end_date: contract?.end_date ?? "",
      entity_id: (contract as any)?.entity_id ?? "",
    },
  });

  const handleDataExtracted = (data: ExtractedContractData, path: string, name: string) => {
    // Update file info
    setFilePath(path);
    setFileName(name);
    
    // Auto-fill form fields with extracted data (only if field is empty or we're creating new)
    if (data.title && !form.getValues("title")) {
      form.setValue("title", data.title);
    }
    if (data.type && !form.getValues("type")) {
      form.setValue("type", data.type);
    }
    if (data.parties && data.parties.length > 0) {
      const currentParties = form.getValues("parties");
      if (!currentParties || (Array.isArray(currentParties) && currentParties.length === 0)) {
        form.setValue("parties", data.parties);
      }
    }
    if (data.start_date && !form.getValues("start_date")) {
      form.setValue("start_date", data.start_date);
    }
    if (data.end_date && !form.getValues("end_date")) {
      form.setValue("end_date", data.end_date);
    }
    if (data.status && form.getValues("status") === "active") {
      form.setValue("status", data.status);
    }
    if (data.entity_id && !form.getValues("entity_id")) {
      form.setValue("entity_id", data.entity_id);
    }
    
    // Store summary
    if (data.summary) {
      setAiSummary(data.summary);
      setSummaryGeneratedAt(new Date().toISOString());
    }
  };

  const handleFileRemoved = () => {
    setFilePath(null);
    setFileName(null);
  };

  const handleFileUpload = (path: string, name: string) => {
    setFilePath(path);
    setFileName(name);
  };

  const handleSummaryGenerated = (summary: string) => {
    setAiSummary(summary);
    setSummaryGeneratedAt(new Date().toISOString());
  };

  const handleSubmit = (data: ContractFormData) => {
    // Parse parties from comma-separated string if needed
    const parties = typeof data.parties === 'string' 
      ? (data.parties as string).split(',').map(p => p.trim()).filter(Boolean)
      : data.parties;
    onSubmit({ 
      ...data, 
      parties,
      file_path: filePath || undefined,
      file_name: fileName || undefined,
      ai_summary: aiSummary || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* AI Upload Section - Only for new contracts without file */}
        {!contract?.id && !filePath && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Upload Contract (Optional)</h4>
            <AnalyzeContractUpload
              onDataExtracted={handleDataExtracted}
              existingFilePath={filePath}
              existingFileName={fileName}
              onFileRemoved={handleFileRemoved}
            />
          </div>
        )}

        {/* Show uploaded file for new contracts */}
        {!contract?.id && filePath && fileName && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Uploaded Contract</h4>
            <AnalyzeContractUpload
              onDataExtracted={handleDataExtracted}
              existingFilePath={filePath}
              existingFileName={fileName}
              onFileRemoved={handleFileRemoved}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="entity_id" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Linked Entity</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} 
                value={field.value || "__none__"}
              >
                <FormControl><SelectTrigger><SelectValue placeholder="Select entity (optional)" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="__none__">No entity</SelectItem>
                  {entities?.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Contract Title *</FormLabel>
              <FormControl><Input placeholder="Office Lease Agreement" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Lease">Lease</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Employment">Employment</SelectItem>
                  <SelectItem value="NDA">NDA</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="parties" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Parties (comma-separated)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Acme Corp, Jane Doe" 
                  value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="start_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="end_date" render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* AI Summary Display */}
        {aiSummary && (
          <ContractSummary summary={aiSummary} generatedAt={summaryGeneratedAt} />
        )}

        {/* File Upload Section - For existing contracts */}
        {contract?.id && (
          <div className="space-y-4 pt-2 border-t border-border">
            <h4 className="text-sm font-medium text-foreground">Contract Document</h4>
            <ContractFileUpload
              contractId={contract.id}
              existingFilePath={filePath}
              existingFileName={fileName}
              onUploadComplete={handleFileUpload}
              onSummaryGenerated={handleSummaryGenerated}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : contract ? "Update Contract" : "Add Contract"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContractForm;
