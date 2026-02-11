import { useState, useRef } from "react";
import { Plus, Trash2, Upload, FileText, Image, Loader2, X, Sparkles, Download } from "lucide-react";
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

export interface ExtractedPersonData {
  holder_name?: string;
  holder_address?: string;
  date_of_birth?: string;
  nationality?: string;
}

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

interface IdDocumentsManagerProps {
  recordId: string;
  documents: IdDocument[];
  onChange: (documents: IdDocument[]) => void;
  storageFolder?: string; // e.g., "directors" or "shareholders"
  onPersonDataExtracted?: (data: ExtractedPersonData) => void;
}

const IdDocumentsManager = ({
  recordId,
  documents,
  onChange,
  storageFolder = "records",
  onPersonDataExtracted,
}: IdDocumentsManagerProps) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
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
      const filePath = `${storageFolder}/${recordId}/${Date.now()}-${index}.${fileExt}`;

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

  // Analyze document with AI
  const handleAnalyzeDocument = async (index: number) => {
    const doc = documents[index];
    if (!doc.file_path) {
      toast.error("Please upload a document first");
      return;
    }

    setAnalyzingIndex(index);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to analyze documents");
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-id-document", {
        body: { filePath: doc.file_path },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Analysis error:", error);
        toast.error("Failed to analyze document");
        return;
      }

      if (data?.success && data?.data) {
        const extracted = data.data;
        let fieldsUpdated = 0;
        const updates: Partial<IdDocument> = {};

        // Update document fields
        if (extracted.document_type && !doc.document_type) {
          updates.document_type = extracted.document_type;
          fieldsUpdated++;
        }
        if (extracted.document_number && !doc.document_number) {
          updates.document_number = extracted.document_number;
          fieldsUpdated++;
        }
        if (extracted.expiry_date && !doc.expiry_date) {
          updates.expiry_date = extracted.expiry_date;
          fieldsUpdated++;
        }

        if (Object.keys(updates).length > 0) {
          updateDocument(index, updates);
        }

        // Pass person data to parent if callback provided
        if (onPersonDataExtracted) {
          const personData: ExtractedPersonData = {};
          if (extracted.holder_name) personData.holder_name = extracted.holder_name;
          if (extracted.holder_address) personData.holder_address = extracted.holder_address;
          if (extracted.date_of_birth) personData.date_of_birth = extracted.date_of_birth;
          if (extracted.nationality) personData.nationality = extracted.nationality;

          if (Object.keys(personData).length > 0) {
            onPersonDataExtracted(personData);
          }
        }

        if (fieldsUpdated > 0) {
          toast.success(`Extracted ${fieldsUpdated} field${fieldsUpdated > 1 ? "s" : ""} from document`);
        } else {
          toast.info("No new fields extracted (fields may already be filled)");
        }
      } else {
        toast.error("No data could be extracted from the document");
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      toast.error("Failed to analyze document");
    } finally {
      setAnalyzingIndex(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">ID Documents</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDocument}
          className="gap-1 h-7"
        >
          <Plus className="w-3 h-3" />
          Add ID
        </Button>
      </div>

      {documents.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">
          No ID documents. Click "Add ID" to add one.
        </p>
      )}

      {documents.map((doc, index) => (
        <div
          key={index}
          className="p-3 border rounded-lg bg-muted/30 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              ID #{index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeDocument(index)}
              className="h-6 w-6 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Type *</label>
              <Select
                value={doc.document_type}
                onValueChange={(value) =>
                  updateDocument(index, { document_type: value })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select" />
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
              <label className="text-xs text-muted-foreground">Number</label>
              <Input
                className="h-8 text-xs"
                placeholder="ABC123456"
                value={doc.document_number}
                onChange={(e) =>
                  updateDocument(index, { document_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Expiry</label>
              <Input
                className="h-8 text-xs"
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
            <div className="flex items-center gap-2 p-2 rounded bg-background border border-border">
              {getFileIcon(doc.file_name)}
              <span className="flex-1 text-xs truncate">{doc.file_name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.storage
                      .from("id-documents")
                      .download(doc.file_path);
                    if (error) throw error;
                    const url = URL.createObjectURL(data);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = doc.file_name || "document";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error("Download error:", err);
                    toast.error("Failed to download file");
                  }
                }}
                className="h-6 w-6 text-green-600 hover:text-green-500"
                title="Download"
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAnalyzeDocument(index)}
                disabled={analyzingIndex === index}
                className="h-6 px-2 gap-1"
                title="Analyze with AI"
              >
                {analyzingIndex === index ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-primary" />
                )}
                <span className="text-xs">Analyze</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(index)}
                className="h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRefs.current[index]?.click()}
              disabled={uploadingIndex === index}
              className={cn(
                "w-full flex items-center justify-center gap-2 p-2 rounded border border-dashed border-border",
                "hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer text-xs",
                uploadingIndex === index && "opacity-50 cursor-not-allowed"
              )}
            >
              {uploadingIndex === index ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              <span>
                {uploadingIndex === index ? "Uploading..." : "Upload scan"}
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default IdDocumentsManager;
