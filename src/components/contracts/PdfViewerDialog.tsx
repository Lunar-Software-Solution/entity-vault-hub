import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PdfViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null;
  fileName: string | null;
}

const PdfViewerDialog = ({ open, onOpenChange, filePath, fileName }: PdfViewerDialogProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (open && filePath) {
        setIsLoading(true);
        setError(null);
        setPdfUrl(null);
        
        // Clean up previous blob URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        
        try {
          const { data, error: downloadError } = await supabase.storage
            .from('contract-files')
            .download(filePath);
          
          if (downloadError) {
            setError(downloadError.message);
            setIsLoading(false);
            return;
          }
          
          if (data) {
            // Create blob with explicit PDF type
            const pdfBlob = new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);
            blobUrlRef.current = url;
            setPdfUrl(url);
          }
        } catch (err) {
          setError('Failed to load PDF');
        }
        setIsLoading(false);
      }
    };

    if (open && filePath) {
      loadPdf();
    }

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [open, filePath]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open && blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setPdfUrl(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{fileName || "View Contract"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 p-6 pt-4">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-destructive bg-muted rounded-lg">
              Error loading PDF: {error}
            </div>
          ) : pdfUrl ? (
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full h-full rounded-lg"
              style={{ minHeight: '100%' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted rounded-lg">
              No PDF to display
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerDialog;
