import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Document, Page, pdfjs } from "react-pdf";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null;
  fileName: string | null;
}

const PdfViewerDialog = ({ open, onOpenChange, filePath, fileName }: PdfViewerDialogProps) => {
  const [pdfBytes, setPdfBytes] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    const loadPdf = async () => {
      if (open && filePath) {
        setIsLoading(true);
        setError(null);
        setPdfBytes(null);
        setPageNumber(1);
        setNumPages(0);
        
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
            // Convert blob to regular array to avoid ArrayBuffer detachment issues
            const arrayBuffer = await data.arrayBuffer();
            const byteArray = Array.from(new Uint8Array(arrayBuffer));
            setPdfBytes(byteArray);
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
  }, [open, filePath]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setPdfBytes(null);
      setError(null);
      setNumPages(0);
      setPageNumber(1);
      setScale(1.0);
    }
  }, [open]);

  // Memoize file prop to prevent unnecessary reloads
  const file = useMemo(() => {
    if (!pdfBytes) return null;
    return { data: new Uint8Array(pdfBytes) };
  }, [pdfBytes]);

  const onDocumentLoadSuccess = ({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('PDF load error:', err);
    setError(err.message || 'Failed to load PDF');
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{fileName || "View Contract"}</DialogTitle>
              <DialogDescription className="sr-only">PDF document viewer</DialogDescription>
            </div>
            {numPages > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button variant="outline" size="icon" onClick={zoomIn} disabled={scale >= 2.5}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-auto bg-muted">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-destructive p-4">
              Error loading PDF: {error}
            </div>
          ) : file ? (
            <div className="flex justify-center p-4">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  className="shadow-lg"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={
                    <div className="flex items-center justify-center p-8 bg-white min-h-[400px] min-w-[300px]">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  }
                />
              </Document>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No PDF to display
            </div>
          )}
        </div>

        {numPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-3 border-t border-border bg-background">
            <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pageNumber} of {numPages}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= numPages}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerDialog;
