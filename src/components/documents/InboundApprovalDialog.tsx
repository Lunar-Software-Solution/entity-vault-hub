import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Building2 } from "lucide-react";
import { useEntities, useDocumentTypes } from "@/hooks/usePortalData";
import { useApproveInboundDocument } from "@/hooks/useInboundQueue";
import type { InboundQueueItem } from "@/hooks/useInboundQueue";

interface InboundApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InboundQueueItem | null;
}

export default function InboundApprovalDialog({
  open,
  onOpenChange,
  item,
}: InboundApprovalDialogProps) {
  const { data: entities = [] } = useEntities();
  const { data: documentTypes = [] } = useDocumentTypes();
  const approveMutation = useApproveInboundDocument();

  const [entityId, setEntityId] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) {
      setEntityId(item.suggested_entity_id || "");
      setDocumentTypeId(item.suggested_doc_type_id || "");
      setTitle(item.ai_analysis?.title || item.file_name.replace(/\.[^/.]+$/, ""));
      setNotes("");
    }
  }, [item]);

  const handleApprove = () => {
    if (!item || !entityId || !documentTypeId || !title) return;

    approveMutation.mutate(
      {
        queueItem: item,
        entityId,
        documentTypeId,
        title,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const aiAnalysis = item?.ai_analysis;
  const hasAiSuggestions = aiAnalysis && (aiAnalysis.entity_name || aiAnalysis.document_type_code);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Approve Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Suggestions Banner */}
          {hasAiSuggestions && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <Sparkles className="h-4 w-4" />
                AI Suggestions
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {aiAnalysis.entity_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    <span>Entity: {aiAnalysis.entity_name}</span>
                    {aiAnalysis.confidence && (
                      <Badge variant="secondary" className="text-xs">
                        {aiAnalysis.confidence}% confidence
                      </Badge>
                    )}
                  </div>
                )}
                {aiAnalysis.document_type_code && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span>Type: {aiAnalysis.document_type_code}</span>
                  </div>
                )}
                {aiAnalysis.summary && (
                  <p className="mt-2 text-xs italic">"{aiAnalysis.summary}"</p>
                )}
              </div>
            </div>
          )}

          {/* Entity Selection */}
          <div className="space-y-2">
            <Label htmlFor="entity">Entity *</Label>
            <Select value={entityId} onValueChange={setEntityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="docType">Document Type *</Label>
            <Select value={documentTypeId} onValueChange={setDocumentTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((dt) => (
                  <SelectItem key={dt.id} value={dt.id}>
                    {dt.code} - {dt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this document"
              rows={3}
            />
          </div>

          {/* Original Email Info */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            <p>From: {item?.email_from}</p>
            {item?.email_subject && <p>Subject: {item.email_subject}</p>}
            <p>File: {item?.file_name}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!entityId || !documentTypeId || !title || approveMutation.isPending}
          >
            {approveMutation.isPending ? "Approving..." : "Approve & Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
