import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const loadPdf = async () => {
      if (open && filePath) {
        setIsLoading(true);
        setError(null);
        
        // Download the file as a blob to bypass Content-Disposition headers
        const { data, error: downloadError } = await supabase.storage
          .from('contract-files')
          .download(filePath);
        
        if (downloadError) {
          setError(downloadError.message);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          // Create a blob URL for the PDF
          const blobUrl = URL.createObjectURL(data);
          setPdfUrl(blobUrl);
        }
        setIsLoading(false);
      }
    };

    loadPdf();

    // Cleanup blob URL when dialog closes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [open, filePath]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{fileName || "View Contract"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-destructive">
              Error loading PDF: {error}
            </div>
          ) : pdfUrl ? (
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full rounded-lg border border-border"
            >
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-lg border border-border"
                title={fileName || "PDF Viewer"}
              />
            </object>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No PDF to display
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerDialog;
