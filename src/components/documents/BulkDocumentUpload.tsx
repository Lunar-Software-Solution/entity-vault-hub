import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useEntities, useDocumentTypes } from "@/hooks/usePortalData";
import { useCreateEntityDocument } from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Check,
  X,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Edit2,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentAnalysis {
  entity: { id: string; name: string } | null;
  title: string;
  documentType: { id: string; code: string; name: string; category: string } | null;
  issuedDate: string | null;
  expiryDate: string | null;
  issuingAuthority: string | null;
  referenceNumber: string | null;
  summary: string | null;
  confidence: number;
}

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "analyzing" | "ready" | "approved" | "saving" | "saved" | "error";
  progress: number;
  filePath?: string;
  analysis?: DocumentAnalysis;
  userEdits?: Partial<DocumentAnalysis>;
  error?: string;
  expanded?: boolean;
}

interface BulkDocumentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedEntityId?: string;
}

const categoryColors: Record<string, string> = {
  Formation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Tax: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Governance: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Legal: "bg-green-500/20 text-green-400 border-green-500/30",
  Other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const BulkDocumentUpload = ({
  open,
  onOpenChange,
  preselectedEntityId,
}: BulkDocumentUploadProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<"upload" | "review">("upload");

  const { data: entities } = useEntities();
  const { data: documentTypes } = useDocumentTypes();
  const createDocument = useCreateEntityDocument();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const uploadAndAnalyze = async (uploadFile: UploadFile) => {
    // Update to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "uploading" as const, progress: 20 } : f
      )
    );

    try {
      // Upload to temporary location
      const tempId = crypto.randomUUID();
      const filePath = `temp/${tempId}/${uploadFile.file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("entity-documents")
        .upload(filePath, uploadFile.file);

      if (uploadError) throw uploadError;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "analyzing" as const, progress: 50, filePath }
            : f
        )
      );

      // Call AI analysis edge function
      const response = await supabase.functions.invoke("analyze-bulk-documents", {
        body: { filePath, fileName: uploadFile.file.name },
      });

      if (response.error) {
        throw new Error(response.error.message || "Analysis failed");
      }

      const { analysis } = response.data;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "ready" as const,
                progress: 100,
                analysis,
              }
            : f
        )
      );
    } catch (error: any) {
      console.error("Upload/analysis error:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error" as const, error: error.message }
            : f
        )
      );
    }
  };

  const processAllFiles = async () => {
    setIsProcessing(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    // Process files sequentially to avoid rate limits
    for (const file of pendingFiles) {
      await uploadAndAnalyze(file);
    }

    setIsProcessing(false);
    setStep("review");
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllReady = () => {
    const readyIds = files.filter((f) => f.status === "ready").map((f) => f.id);
    setSelectedFiles(new Set(readyIds));
  };

  const updateFileEdit = (
    fileId: string,
    field: keyof DocumentAnalysis,
    value: any
  ) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== fileId) return f;
        const currentEdits = f.userEdits || {};
        return {
          ...f,
          userEdits: { ...currentEdits, [field]: value },
        };
      })
    );
  };

  const getEffectiveValue = (
    file: UploadFile,
    field: keyof DocumentAnalysis
  ) => {
    if (file.userEdits?.[field] !== undefined) {
      return file.userEdits[field];
    }
    return file.analysis?.[field];
  };

  const toggleExpanded = (id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, expanded: !f.expanded } : f
      )
    );
  };

  const saveSelectedDocuments = async () => {
    const toSave = files.filter((f) => selectedFiles.has(f.id) && f.status === "ready");

    if (toSave.length === 0) {
      toast.error("No documents selected");
      return;
    }

    // Check all have entities
    const missingEntity = toSave.find(
      (f) => !getEffectiveValue(f, "entity")
    );
    if (missingEntity) {
      toast.error(
        `Please select an entity for "${getEffectiveValue(missingEntity, "title")}"`
      );
      return;
    }

    setIsSaving(true);

    for (const file of toSave) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "saving" as const } : f
        )
      );

      try {
        const entity = getEffectiveValue(file, "entity") as { id: string; name: string };
        const docType = getEffectiveValue(file, "documentType") as { id: string } | null;

        // Move file from temp to entity folder
        const newPath = `${entity.id}/${Date.now()}-${file.file.name}`;
        
        // Copy to new location
        const { error: copyError } = await supabase.storage
          .from("entity-documents")
          .copy(file.filePath!, newPath);

        if (copyError) throw copyError;

        // Delete from temp
        await supabase.storage
          .from("entity-documents")
          .remove([file.filePath!]);

        // Create document record
        await createDocument.mutateAsync({
          entity_id: entity.id,
          title: getEffectiveValue(file, "title") as string,
          document_type_id: docType?.id || null,
          file_path: newPath,
          file_name: file.file.name,
          issued_date: getEffectiveValue(file, "issuedDate") as string | null,
          expiry_date: getEffectiveValue(file, "expiryDate") as string | null,
          issuing_authority: getEffectiveValue(file, "issuingAuthority") as string | null,
          reference_number: getEffectiveValue(file, "referenceNumber") as string | null,
          notes: getEffectiveValue(file, "summary") as string | null,
          status: "current",
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "saved" as const } : f
          )
        );
      } catch (error: any) {
        console.error("Save error:", error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "error" as const, error: error.message }
              : f
          )
        );
      }
    }

    setIsSaving(false);
    setSelectedFiles(new Set());

    const savedCount = files.filter((f) => f.status === "saved").length;
    if (savedCount > 0) {
      toast.success(`Successfully saved ${savedCount} document(s)`);
    }
  };

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file?.filePath) {
      supabase.storage.from("entity-documents").remove([file.filePath]);
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleClose = () => {
    // Clean up temp files
    files.forEach((f) => {
      if (f.filePath && f.status !== "saved") {
        supabase.storage.from("entity-documents").remove([f.filePath]);
      }
    });
    setFiles([]);
    setSelectedFiles(new Set());
    setStep("upload");
    onOpenChange(false);
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const readyCount = files.filter((f) => f.status === "ready").length;
  const savedCount = files.filter((f) => f.status === "saved").length;
  const analyzingCount = files.filter(
    (f) => f.status === "uploading" || f.status === "analyzing"
  ).length;

  // Group document types by category
  const groupedTypes = documentTypes?.reduce((acc, type) => {
    const category = type.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {} as Record<string, typeof documentTypes>) || {};

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Bulk Document Upload
            {step === "review" && (
              <Badge variant="outline" className="ml-2">
                Review & Approve
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-6 flex-1 overflow-auto">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              {isDragActive ? (
                <p className="text-foreground font-medium">Drop files here...</p>
              ) : (
                <>
                  <p className="text-foreground font-medium mb-1">
                    Drag & drop PDF files here, or click to browse
                  </p>
                  <p className="text-muted-foreground text-sm">
                    AI will analyze each document to identify the entity, type, and metadata
                  </p>
                </>
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">
                    Files ({files.length})
                  </h4>
                  {pendingCount > 0 && (
                    <Badge variant="outline">{pendingCount} ready to analyze</Badge>
                  )}
                </div>

                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 pr-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.file.name}
                          </p>
                          {(file.status === "uploading" ||
                            file.status === "analyzing") && (
                            <>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {file.status === "uploading"
                                  ? "Uploading..."
                                  : "Analyzing with AI..."}
                              </p>
                              <Progress value={file.progress} className="h-1 mt-1" />
                            </>
                          )}
                          {file.status === "error" && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {file.error}
                            </p>
                          )}
                          {file.status === "ready" && (
                            <p className="text-xs text-green-500 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Ready for review
                            </p>
                          )}
                        </div>
                        {file.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={processAllFiles}
                disabled={pendingCount === 0 || isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing {analyzingCount} of {pendingCount}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze {pendingCount} File{pendingCount !== 1 ? "s" : ""} with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Review Step */
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Selection toolbar */}
            {readyCount > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">
                  {selectedFiles.size} of {readyCount} selected
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={selectAllReady}
                  className="text-xs p-0 h-auto"
                >
                  Select all
                </Button>
                {selectedFiles.size > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSelectedFiles(new Set())}
                    className="text-xs p-0 h-auto text-muted-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}

            {/* Document cards */}
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {files
                  .filter((f) => f.status === "ready" || f.status === "saved" || f.status === "saving")
                  .map((file) => {
                    const entity = getEffectiveValue(file, "entity") as { id: string; name: string } | null;
                    const docType = getEffectiveValue(file, "documentType") as { id: string; code: string; name: string; category: string } | null;
                    const title = getEffectiveValue(file, "title") as string;
                    const confidence = file.analysis?.confidence || 0;

                    return (
                      <div
                        key={file.id}
                        className={cn(
                          "border rounded-lg overflow-hidden transition-all",
                          selectedFiles.has(file.id)
                            ? "border-primary bg-primary/5"
                            : "border-border",
                          file.status === "saved" && "opacity-60"
                        )}
                      >
                        {/* Header row */}
                        <div className="flex items-center gap-3 p-4">
                          {file.status === "ready" && (
                            <Checkbox
                              checked={selectedFiles.has(file.id)}
                              onCheckedChange={() => toggleFileSelection(file.id)}
                            />
                          )}
                          {file.status === "saving" && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {file.status === "saved" && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}

                          <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground truncate">
                                {title}
                              </p>
                              {docType && (
                                <Badge
                                  variant="outline"
                                  className={categoryColors[docType.category] || categoryColors.Other}
                                >
                                  {docType.code}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {entity ? (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {entity.name}
                                </span>
                              ) : (
                                <span className="text-xs text-amber-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  No entity detected
                                </span>
                              )}
                              {confidence > 0 && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] h-5",
                                    confidence >= 80
                                      ? "bg-green-500/20 text-green-400"
                                      : confidence >= 50
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "bg-red-500/20 text-red-400"
                                  )}
                                >
                                  {confidence}% confidence
                                </Badge>
                              )}
                            </div>
                          </div>

                          {file.status === "ready" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(file.id)}
                              className="gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                              {file.expanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Expanded edit form */}
                        {file.expanded && file.status === "ready" && (
                          <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/30 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Entity */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Entity *
                                </label>
                                <Select
                                  value={entity?.id || ""}
                                  onValueChange={(value) => {
                                    const selected = entities?.find((e) => e.id === value);
                                    if (selected) {
                                      updateFileEdit(file.id, "entity", {
                                        id: selected.id,
                                        name: selected.name,
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-9 bg-background">
                                    <SelectValue placeholder="Select entity" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background">
                                    {entities?.map((e) => (
                                      <SelectItem key={e.id} value={e.id}>
                                        {e.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Document Type */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Document Type
                                </label>
                                <Select
                                  value={docType?.id || "__none__"}
                                  onValueChange={(value) => {
                                    if (value === "__none__") {
                                      updateFileEdit(file.id, "documentType", null);
                                    } else {
                                      const selected = documentTypes?.find(
                                        (dt) => dt.id === value
                                      );
                                      if (selected) {
                                        updateFileEdit(file.id, "documentType", selected);
                                      }
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-9 bg-background">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background max-h-[200px]">
                                    <SelectItem value="__none__">No type</SelectItem>
                                    {Object.entries(groupedTypes).map(
                                      ([category, types]) => (
                                        <div key={category}>
                                          <div
                                            className={`px-2 py-1 text-xs font-semibold ${
                                              categoryColors[category] ||
                                              categoryColors.Other
                                            }`}
                                          >
                                            {category}
                                          </div>
                                          {types!.map((type) => (
                                            <SelectItem
                                              key={type.id}
                                              value={type.id}
                                            >
                                              {type.code} - {type.name}
                                            </SelectItem>
                                          ))}
                                        </div>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Title */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Title
                                </label>
                                <Input
                                  className="h-9 bg-background"
                                  value={title}
                                  onChange={(e) =>
                                    updateFileEdit(file.id, "title", e.target.value)
                                  }
                                />
                              </div>

                              {/* Reference Number */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Reference Number
                                </label>
                                <Input
                                  className="h-9 bg-background"
                                  value={
                                    (getEffectiveValue(
                                      file,
                                      "referenceNumber"
                                    ) as string) || ""
                                  }
                                  onChange={(e) =>
                                    updateFileEdit(
                                      file.id,
                                      "referenceNumber",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              {/* Issued Date */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Issued Date
                                </label>
                                <Input
                                  className="h-9 bg-background"
                                  type="date"
                                  value={
                                    (getEffectiveValue(file, "issuedDate") as string) ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    updateFileEdit(file.id, "issuedDate", e.target.value)
                                  }
                                />
                              </div>

                              {/* Expiry Date */}
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Expiry Date
                                </label>
                                <Input
                                  className="h-9 bg-background"
                                  type="date"
                                  value={
                                    (getEffectiveValue(file, "expiryDate") as string) ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    updateFileEdit(file.id, "expiryDate", e.target.value)
                                  }
                                />
                              </div>

                              {/* Issuing Authority */}
                              <div className="col-span-2 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Issuing Authority
                                </label>
                                <Input
                                  className="h-9 bg-background"
                                  value={
                                    (getEffectiveValue(
                                      file,
                                      "issuingAuthority"
                                    ) as string) || ""
                                  }
                                  onChange={(e) =>
                                    updateFileEdit(
                                      file.id,
                                      "issuingAuthority",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* AI Summary */}
                            {file.analysis?.summary && (
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  AI Summary
                                </label>
                                <p className="text-xs text-muted-foreground bg-background p-2 rounded border">
                                  {file.analysis.summary}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-between gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setStep("upload")}>
                ← Back to Upload
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={saveSelectedDocuments}
                  disabled={selectedFiles.size === 0 || isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save {selectedFiles.size} Document
                      {selectedFiles.size !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {savedCount > 0 && (
              <p className="text-sm text-green-500 text-center">
                ✓ {savedCount} document(s) saved successfully
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkDocumentUpload;
