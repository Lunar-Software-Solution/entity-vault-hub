import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import GravatarAvatar from "./GravatarAvatar";

interface AvatarEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  email?: string | null;
  linkedinUrl?: string | null;
  currentAvatarUrl?: string | null;
  recordId?: string;
  tableName: "directors_ubos" | "shareholders";
  onAvatarChange: (newUrl: string | null, deleted: boolean) => void;
}

const AvatarEditDialog = ({
  open,
  onOpenChange,
  name,
  email,
  linkedinUrl,
  currentAvatarUrl,
  recordId,
  tableName,
  onAvatarChange,
}: AvatarEditDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatarUrl = previewUrl || currentAvatarUrl;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      // Create unique file path
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const uniqueId = recordId || crypto.randomUUID();
      const fileName = `${tableName}/${uniqueId}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Add cache buster to force refresh
      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setPreviewUrl(newAvatarUrl);

      // Update database if we have a record ID
      if (recordId) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ avatar_url: urlData.publicUrl, suppress_avatar: false })
          .eq("id", recordId);

        if (updateError) throw updateError;
      }

      onAvatarChange(urlData.publicUrl, false);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (recordId) {
        // Update database to suppress avatar
        const { error } = await supabase
          .from(tableName)
          .update({ avatar_url: null, suppress_avatar: true })
          .eq("id", recordId);

        if (error) throw error;
      }

      setPreviewUrl(null);
      onAvatarChange(null, true);
      toast.success("Avatar removed");
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast.error("Failed to remove avatar");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture or remove the current one.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Avatar Preview */}
          <div className="relative">
            <GravatarAvatar
              email={undefined}
              name={name}
              size="2xl"
              storedAvatarUrl={displayAvatarUrl}
              enableEnrichment={false}
              className="w-32 h-32"
            />
          </div>

          {/* Upload Button */}
          <div className="flex flex-col items-center gap-2 w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full max-w-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Picture
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Max file size: 2MB. Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {(displayAvatarUrl || email || linkedinUrl) && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Picture
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarEditDialog;
