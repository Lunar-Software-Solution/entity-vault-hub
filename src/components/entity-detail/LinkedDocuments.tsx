import { useState } from "react";
import { FileText, Plus, Edit, Trash2, Eye, Calendar, Building2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useDocumentTypes, type EntityDocument } from "@/hooks/usePortalData";
import { useCreateEntityDocument, useUpdateEntityDocument, useDeleteEntityDocument } from "@/hooks/usePortalMutations";
import EntityDocumentForm from "@/components/forms/EntityDocumentForm";
import type { EntityDocumentFormData } from "@/lib/formSchemas";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import PdfViewerDialog from "@/components/contracts/PdfViewerDialog";

interface LinkedDocumentsProps {
  documents: EntityDocument[];
  entityId: string;
}

const categoryColors: Record<string, string> = {
  Formation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Tax: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Governance: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Legal: "bg-green-500/20 text-green-400 border-green-500/30",
  Other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const statusColors: Record<string, string> = {
  current: "bg-emerald-500/20 text-emerald-400",
  superseded: "bg-amber-500/20 text-amber-400",
  expired: "bg-red-500/20 text-red-400",
};

const LinkedDocuments = ({ documents, entityId }: LinkedDocumentsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EntityDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<EntityDocument | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ path: string; name: string } | null>(null);

  const { data: documentTypes } = useDocumentTypes();
  const createMutation = useCreateEntityDocument();
  const updateMutation = useUpdateEntityDocument();
  const deleteMutation = useDeleteEntityDocument();

  const getDocumentType = (typeId: string | null) => {
    if (!typeId) return null;
    return documentTypes?.find((t) => t.id === typeId);
  };

  const handleSubmit = (data: EntityDocumentFormData) => {
    const payload = {
      entity_id: entityId,
      document_type_id: data.document_type_id === "__none__" ? null : data.document_type_id || null,
      title: data.title,
      file_path: data.file_path || null,
      file_name: data.file_name || null,
      issued_date: data.issued_date || null,
      expiry_date: data.expiry_date || null,
      issuing_authority: data.issuing_authority || null,
      reference_number: data.reference_number || null,
      notes: data.notes || null,
      status: data.status,
    };

    if (editingDocument) {
      updateMutation.mutate(
        { id: editingDocument.id, ...payload },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingDocument(null);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleDelete = () => {
    if (deletingDocument) {
      deleteMutation.mutate(deletingDocument.id, {
        onSuccess: () => setDeletingDocument(null),
      });
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Documents</h3>
          <span className="text-sm text-muted-foreground">{documents.length} linked</span>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {documents.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No documents linked to this entity yet.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const docType = getDocumentType(doc.document_type_id);
            const categoryColor = docType?.category ? categoryColors[docType.category] : categoryColors.Other;

            return (
              <div
                key={doc.id}
                className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {docType && (
                        <Badge variant="outline" className={categoryColor}>
                          {docType.code}
                        </Badge>
                      )}
                      <Badge variant="outline" className={statusColors[doc.status] || statusColors.current}>
                        {doc.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground truncate">{doc.title}</p>
                    {docType && (
                      <p className="text-xs text-muted-foreground mt-1">{docType.name}</p>
                    )}

                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      {doc.issued_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Issued: {format(new Date(doc.issued_date), "MMM d, yyyy")}</span>
                        </div>
                      )}
                      {doc.issuing_authority && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{doc.issuing_authority}</span>
                        </div>
                      )}
                      {doc.reference_number && (
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span>{doc.reference_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {doc.file_path && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewingPdf({ path: doc.file_path!, name: doc.file_name || "Document" })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary"
                      onClick={() => {
                        setEditingDocument(doc);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingDocument(doc)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={showForm}
        onOpenChange={() => {
          setShowForm(false);
          setEditingDocument(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDocument ? "Edit Document" : "Add Document"}</DialogTitle>
          </DialogHeader>
          <EntityDocumentForm
            entityId={entityId}
            document={editingDocument}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingDocument(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingDocument}
        onOpenChange={() => setDeletingDocument(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        description={`Are you sure you want to delete "${deletingDocument?.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      {viewingPdf && (
        <PdfViewerDialog
          open={!!viewingPdf}
          onOpenChange={() => setViewingPdf(null)}
          filePath={viewingPdf.path}
          fileName={viewingPdf.name}
          bucketName="entity-documents"
        />
      )}
    </div>
  );
};

export default LinkedDocuments;
