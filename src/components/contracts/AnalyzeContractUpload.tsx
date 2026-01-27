import { useState, useRef } from "react";
import { Upload, FileText, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ExtractedContractData {
  entity_id?: string | null;
  entity_name?: string | null;
  title?: string;
  type?: string;
  parties?: string[];
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  summary?: string | null;
  key_terms?: string[];
  confidence?: number;
}

interface AnalyzeContractUploadProps {
  onDataExtracted: (data: ExtractedContractData, filePath: string, fileName: string) => void;
  existingFilePath?: string | null;
  existingFileName?: string | null;
  onFileRemoved?: () => void;
}

const AnalyzeContractUpload = ({
  onDataExtracted,
  existingFilePath,
  existingFileName,
  onFileRemoved,
}: AnalyzeContractUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ path: string; name: string } | null>(
    existingFilePath && existingFileName
      ? { path: existingFilePath, name: existingFileName }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Generate a temporary file path for new contracts
      const tempId = `temp-${Date.now()}`;
      const fileExt = file.name.split(".").pop();
      const filePath = `${tempId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("contract-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadedFile({ path: filePath, name: file.name });
      toast.success("File uploaded successfully");

      // Trigger AI analysis
      await analyzeContract(filePath, file.name);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeContract = async (filePath: string, fileName: string) => {
    setIsAnalyzing(true);

    try {
      const response = await supabase.functions.invoke("analyze-contract", {
        body: { filePath, fileName },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to analyze contract");
      }

      if (response.data?.extractedData) {
        onDataExtracted(response.data.extractedData, filePath, fileName);
        toast.success("Contract analyzed and form auto-filled!");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      if (error.message?.includes("Rate limit")) {
        toast.error("Rate limit reached. Please try again later.");
      } else if (error.message?.includes("credits")) {
        toast.error("AI credits exhausted. Please add credits.");
      } else {
        toast.error("Failed to analyze contract");
      }
      // Still pass the file info even if analysis fails
      onDataExtracted({}, filePath, fileName);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!uploadedFile) return;

    try {
      await supabase.storage.from("contract-files").remove([uploadedFile.path]);
      setUploadedFile(null);
      onFileRemoved?.();
      toast.success("File removed");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove file");
    }
  };

  const handleReanalyze = async () => {
    if (uploadedFile) {
      await analyzeContract(uploadedFile.path, uploadedFile.name);
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
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Analyzing contract with AI...</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!isAnalyzing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReanalyze}
                className="gap-1"
              >
                <Sparkles className="w-4 h-4" />
                Re-analyze
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              disabled={isAnalyzing}
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
              {isUploading ? "Uploading..." : "Upload Contract PDF"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF files up to 10MB. AI will analyze and auto-fill the form.
            </p>
          </div>
        </button>
      )}
    </div>
  );
};

export default AnalyzeContractUpload;
