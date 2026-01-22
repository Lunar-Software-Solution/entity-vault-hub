import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
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
    let blobUrl: string | null = null;

    const loadPdf = async () => {
      if (open && filePath) {
        setIsLoading(true);
        setError(null);
        setPdfUrl(null);
        
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
            // Create blob URL with correct MIME type
            const blob = new Blob([data], { type: 'application/pdf' });
            blobUrl = URL.createObjectURL(blob);
            setPdfUrl(blobUrl);
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
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [open, filePath]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(null);
      setError(null);
    }
  }, [open]);

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{fileName || "View Contract"}</DialogTitle>
              <DialogDescription className="sr-only">PDF document viewer</DialogDescription>
            </div>
            {pdfUrl && (
              <Button variant="outline" size="sm" onClick={openInNewTab} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 bg-muted">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-destructive">
              Error loading PDF: {error}
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={fileName || "PDF Viewer"}
            />
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
