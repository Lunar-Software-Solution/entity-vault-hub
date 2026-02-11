import { useState, useRef } from "react";
import { Upload, FileText, Image, Loader2, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface TaskFile {
  file_path: string;
  file_name: string;
  file_size?: number;
}

interface TaskDocumentUploadProps {
  taskId?: string;
  files: TaskFile[];
  onChange: (files: TaskFile[]) => void;
}

const TaskDocumentUpload = ({ taskId, files, onChange }: TaskDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tempId = taskId || `temp-${Date.now()}`;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-4 h-4 text-primary" />;
    return <Image className="w-4 h-4 text-primary" />;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    setUploading(true);
    const newFiles: TaskFile[] = [];

    try {
      for (const file of Array.from(selectedFiles)) {
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Skipped "${file.name}" — unsupported file type`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Skipped "${file.name}" — exceeds 10MB limit`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const filePath = `${tempId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("task-documents")
          .upload(filePath, file);

        if (error) {
          console.error("Upload error:", error);
          toast.error(`Failed to upload "${file.name}"`);
          continue;
        }

        newFiles.push({
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
        });
      }

      if (newFiles.length > 0) {
        onChange([...files, ...newFiles]);
        toast.success(`Uploaded ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (index: number) => {
    const file = files[index];
    try {
      await supabase.storage.from("task-documents").remove([file.file_path]);
    } catch (err) {
      console.error("Remove error:", err);
    }
    onChange(files.filter((_, i) => i !== index));
  };

  const handleDownload = async (file: TaskFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("task-documents")
        .download(file.file_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Attachments</label>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border"
            >
              {getFileIcon(file.file_name)}
              <span className="flex-1 text-sm text-foreground truncate">
                {file.file_name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(file)}
                className="h-7 w-7 text-emerald-600 hover:text-emerald-500"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(index)}
                className="h-7 w-7 text-destructive hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border",
          "hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer text-sm",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {uploading ? "Uploading..." : "Upload documents"}
      </button>
    </div>
  );
};

export default TaskDocumentUpload;
