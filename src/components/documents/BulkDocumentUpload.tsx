import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useEntities, useDocumentTypes } from "@/hooks/usePortalData";
import { useCreateEntityDocument } from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, FileText, Check, X, Loader2, Sparkles } from "lucide-react";

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "classifying" | "ready" | "error";
  progress: number;
  suggestedType?: string;
  suggestedTitle?: string;
  entityId?: string;
  error?: string;
}

interface BulkDocumentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedEntityId?: string;
}

const BulkDocumentUpload = ({ open, onOpenChange, preselectedEntityId }: BulkDocumentUploadProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(preselectedEntityId || "");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: entities } = useEntities();
  const { data: documentTypes } = useDocumentTypes();
  const createDocument = useCreateEntityDocument();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      status: "pending",
      progress: 0,
      entityId: selectedEntityId || undefined,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, [selectedEntityId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: true,
  });

  const classifyDocument = async (uploadFile: UploadFile): Promise<{ type: string; title: string }> => {
    // Use AI to classify based on filename
    const filename = uploadFile.file.name.toLowerCase();
    
    // Simple classification based on filename patterns
    let suggestedType = "Other";
    let suggestedTitle = uploadFile.file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    if (filename.includes("certificate") || filename.includes("incorporation") || filename.includes("coi")) {
      suggestedType = "Formation";
    } else if (filename.includes("tax") || filename.includes("1099") || filename.includes("w2") || filename.includes("ss4")) {
      suggestedType = "Tax";
    } else if (filename.includes("bylaw") || filename.includes("resolution") || filename.includes("minutes")) {
      suggestedType = "Governance";
    } else if (filename.includes("agreement") || filename.includes("contract") || filename.includes("license")) {
      suggestedType = "Legal";
    }

    // Find matching document type
    const matchingType = documentTypes?.find(dt => dt.category === suggestedType);
    
    return {
      type: matchingType?.id || "",
      title: suggestedTitle.charAt(0).toUpperCase() + suggestedTitle.slice(1),
    };
  };

  const processFiles = async () => {
    if (!selectedEntityId) {
      toast.error("Please select an entity first");
      return;
    }

    setIsProcessing(true);

    for (const uploadFile of files.filter(f => f.status === "pending")) {
      // Update status to classifying
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "classifying" as const, progress: 10 } : f
        )
      );

      try {
        // Classify the document
        const classification = await classifyDocument(uploadFile);
        
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: "uploading" as const,
                  progress: 30,
                  suggestedType: classification.type,
                  suggestedTitle: classification.title,
                }
              : f
          )
        );

        // Upload to storage
        const filePath = `${selectedEntityId}/${Date.now()}-${uploadFile.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("entity-documents")
          .upload(filePath, uploadFile.file);

        if (uploadError) throw uploadError;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, progress: 70 } : f
          )
        );

        // Create document record
        await createDocument.mutateAsync({
          entity_id: selectedEntityId,
          title: classification.title,
          document_type_id: classification.type || null,
          file_path: filePath,
          file_name: uploadFile.file.name,
          status: "current",
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "ready" as const, progress: 100 } : f
          )
        );
      } catch (error: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error" as const, error: error.message }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    
    const successCount = files.filter(f => f.status === "ready").length;
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} document(s)`);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClose = () => {
    setFiles([]);
    onOpenChange(false);
  };

  const pendingCount = files.filter(f => f.status === "pending").length;
  const readyCount = files.filter(f => f.status === "ready").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Bulk Document Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entity Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select Entity *
            </label>
            <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose an entity for all documents" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {entities?.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-foreground font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-foreground font-medium mb-1">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-muted-foreground text-sm">
                  Supports PDF, Word, and image files
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
                  <Badge variant="outline">{pendingCount} pending</Badge>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.suggestedTitle || file.file.name}
                      </p>
                      {file.status === "classifying" && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Classifying with AI...
                        </p>
                      )}
                      {file.status === "uploading" && (
                        <Progress value={file.progress} className="h-1 mt-1" />
                      )}
                      {file.status === "error" && (
                        <p className="text-xs text-destructive">{file.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === "ready" && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                      {file.status === "error" && (
                        <X className="w-5 h-5 text-destructive" />
                      )}
                      {(file.status === "pending" || file.status === "error") && (
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={processFiles}
              disabled={!selectedEntityId || pendingCount === 0 || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {pendingCount} File{pendingCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDocumentUpload;
