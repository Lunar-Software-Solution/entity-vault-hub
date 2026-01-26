import { useState, useRef } from "react";
import { Upload, FileText, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ExtractedDocumentData {
  title?: string | null;
  document_type_id?: string | null;
  issued_date?: string | null;
  expiry_date?: string | null;
  issuing_authority?: string | null;
  reference_number?: string | null;
}

interface DocumentFileUploadProps {
  documentId: string;
  existingFilePath?: string | null;
  existingFileName?: string | null;
  onUploadComplete: (filePath: string, fileName: string) => void;
  onSummaryGenerated?: (summary: string, generatedAt: string) => void;
  onDataExtracted?: (data: ExtractedDocumentData) => void;
}

const DocumentFileUpload = ({
  documentId,
  existingFilePath,
  existingFileName,
  onUploadComplete,
  onSummaryGenerated,
  onDataExtracted,
}: DocumentFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ path: string; name: string } | null>(
    existingFilePath && existingFileName
      ? { path: existingFilePath, name: existingFileName }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateSummary = async (filePath: string) => {
    setIsSummarizing(true);

    try {
      const response = await supabase.functions.invoke("summarize-document", {
        body: { documentId, filePath },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate summary");
      }

      if (response.data?.summary && onSummaryGenerated) {
        onSummaryGenerated(response.data.summary, new Date().toISOString());
      }

      // Handle extracted data for auto-fill
      if (response.data?.extractedData && onDataExtracted) {
        onDataExtracted(response.data.extractedData);
        toast.success("Document analyzed and form auto-filled");
      } else if (response.data?.summary) {
        toast.success("AI summary generated");
      }
    } catch (error) {
      console.error("Summary error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate summary";
      if (message.includes("Rate limit")) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (message.includes("credits")) {
        toast.error("AI credits exhausted. Please add credits to continue.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${documentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("entity-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadedFile({ path: filePath, name: file.name });
      onUploadComplete(filePath, file.name);
      toast.success("File uploaded successfully");

      // Automatically generate AI summary
      generateSummary(filePath);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!uploadedFile) return;

    try {
      await supabase.storage.from("entity-documents").remove([uploadedFile.path]);
      setUploadedFile(null);
      onUploadComplete("", "");
      toast.success("File removed");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove file");
    }
  };

  const handleRegenerateSummary = () => {
    if (uploadedFile) {
      generateSummary(uploadedFile.path);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadedFile ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
          <FileText className="w-8 h-8 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {uploadedFile.name}
            </p>
            {isSummarizing && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating AI summary...
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRegenerateSummary}
              disabled={isSummarizing}
              title="Regenerate AI Summary"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border",
            "hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isUploading ? "Uploading..." : "Upload Document PDF"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF files up to 10MB • AI summary will be generated automatically
            </p>
          </div>
        </button>
      )}
    </div>
  );
};

export default DocumentFileUpload;