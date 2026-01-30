import { useState, useRef } from "react";
import { Plus, Trash2, Upload, FileText, Image, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ID_DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID Card" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "residence_permit", label: "Residence Permit" },
  { value: "visa", label: "Visa" },
  { value: "military_id", label: "Military ID" },
  { value: "government_id", label: "Government ID" },
  { value: "state_id", label: "State ID" },
  { value: "social_security", label: "Social Security Card" },
  { value: "tax_id_card", label: "Tax ID Card" },
  { value: "other", label: "Other" },
];

export interface IdDocument {
  id?: string;
  document_type: string;
  document_number: string;
  expiry_date: string;
  file_path: string;
  file_name: string;
  notes?: string;
}

interface MultipleIdDocumentsProps {
  directorId: string;
  documents: IdDocument[];
  onChange: (documents: IdDocument[]) => void;
}

const MultipleIdDocuments = ({
  directorId,
  documents,
  onChange,
}: MultipleIdDocumentsProps) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addDocument = () => {
    onChange([
      ...documents,
      {
        document_type: "",
        document_number: "",
        expiry_date: "",
        file_path: "",
        file_name: "",
      },
    ]);
  };

  const removeDocument = async (index: number) => {
    const doc = documents[index];
    if (doc.file_path) {
      try {
        await supabase.storage.from("id-documents").remove([doc.file_path]);
      } catch (error) {
        console.error("Error removing file:", error);
      }
    }
    onChange(documents.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, updates: Partial<IdDocument>) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-5 h-5 text-primary" />;
    return <Image className="w-5 h-5 text-primary" />;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
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

    setUploadingIndex(index);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${directorId}/${Date.now()}-${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("id-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      updateDocument(index, { file_path: filePath, file_name: file.name });
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveFile = async (index: number) => {
    const doc = documents[index];
    if (!doc.file_path) return;

    try {
      await supabase.storage.from("id-documents").remove([doc.file_path]);
      updateDocument(index, { file_path: "", file_name: "" });
      toast.success("File removed");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove file");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">ID Documents</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDocument}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add ID
        </Button>
      </div>

      {documents.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          No ID documents added. Click "Add ID" to add one.
        </p>
      )}

      {documents.map((doc, index) => (
        <div
          key={index}
          className="p-4 border rounded-lg bg-muted/30 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              ID Document #{index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeDocument(index)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Type *</label>
              <Select
                value={doc.document_type}
                onValueChange={(value) =>
                  updateDocument(index, { document_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ID_DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Document Number
              </label>
              <Input
                placeholder="ABC123456"
                value={doc.document_number}
                onChange={(e) =>
                  updateDocument(index, { document_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Expiry Date</label>
              <Input
                type="date"
                value={doc.expiry_date}
                onChange={(e) =>
                  updateDocument(index, { expiry_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* File Upload */}
          <input
            ref={(el) => (fileInputRefs.current[index] = el)}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => handleFileSelect(e, index)}
            className="hidden"
          />

          {doc.file_path && doc.file_name ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border">
              {getFileIcon(doc.file_name)}
              <span className="flex-1 text-sm truncate">{doc.file_name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(index)}
                className="h-7 w-7"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRefs.current[index]?.click()}
              disabled={uploadingIndex === index}
              className={cn(
                "w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border",
                "hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer",
                uploadingIndex === index && "opacity-50 cursor-not-allowed"
              )}
            >
              {uploadingIndex === index ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="text-sm">
                {uploadingIndex === index
                  ? "Uploading..."
                  : "Upload scan (PDF or image)"}
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MultipleIdDocuments;