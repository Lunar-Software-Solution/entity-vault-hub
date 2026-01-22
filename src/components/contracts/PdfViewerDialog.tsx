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

  useEffect(() => {
    const loadPdf = async () => {
      if (open && filePath) {
        setIsLoading(true);
        const { data } = await supabase.storage
          .from('contract-files')
          .createSignedUrl(filePath, 3600);
        
        if (data?.signedUrl) {
          setPdfUrl(data.signedUrl);
        }
        setIsLoading(false);
      } else {
        setPdfUrl(null);
      }
    };

    loadPdf();
  }, [open, filePath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{fileName || "View Contract"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full rounded-lg border border-border"
              title={fileName || "PDF Viewer"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Unable to load PDF
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerDialog;
