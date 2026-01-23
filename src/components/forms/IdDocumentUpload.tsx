import { useState, useRef } from "react";
import { Upload, FileText, Image, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface IdDocumentUploadProps {
  directorId: string;
  existingFilePath?: string | null;
  existingFileName?: string | null;
  onUploadComplete: (filePath: string, fileName: string) => void;
}

const IdDocumentUpload = ({
  directorId,
  existingFilePath,
  existingFileName,
  onUploadComplete,
}: IdDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ path: string; name: string } | null>(
    existingFilePath && existingFileName
      ? { path: existingFilePath, name: existingFileName }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-8 h-8 text-primary" />;
    return <Image className="w-8 h-8 text-primary" />;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file (JPEG, PNG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${directorId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("id-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadedFile({ path: filePath, name: file.name });
      onUploadComplete(filePath, file.name);
      toast.success("ID document uploaded successfully");
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
      await supabase.storage.from("id-documents").remove([uploadedFile.path]);
      setUploadedFile(null);
      onUploadComplete("", "");
      toast.success("File removed");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove file");
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadedFile ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
          {getFileIcon(uploadedFile.name)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {uploadedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              ID document uploaded
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border",
            "hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isUploading ? "Uploading..." : "Upload ID Document"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF or images (JPEG, PNG, WebP) up to 10MB
            </p>
          </div>
        </button>
      )}
    </div>
  );
};

export default IdDocumentUpload;