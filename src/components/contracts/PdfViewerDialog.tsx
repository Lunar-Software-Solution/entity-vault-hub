import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (open && filePath) {
        setIsLoading(true);
        setError(null);
        setPdfData(null);
        setPageNumber(1);
        
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
            // Convert to Uint8Array to avoid detached ArrayBuffer issue
            const arrayBuffer = await data.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            setPdfData(uint8Array);
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
      setPdfData(null);
      setError(null);
      setNumPages(0);
      setPageNumber(1);
      setScale(1.0);
    }
  }, [open]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
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
            <DialogTitle className="text-lg">{fileName || "View Contract"}</DialogTitle>
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
        
        <div className="flex-1 min-h-0 overflow-auto bg-muted" ref={containerRef}>
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-destructive">
              Error loading PDF: {error}
            </div>
          ) : pdfData ? (
            <div className="flex justify-center p-4">
              <Document
                file={{ data: pdfData }}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                }
                error={
                  <div className="text-destructive p-8">Failed to load PDF document</div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  className="shadow-lg"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
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
