import { useState, useMemo } from "react";
import { useEntityDocuments, useDocumentTypes, useEntities, type EntityDocument } from "@/hooks/usePortalData";
import { useCreateEntityDocument, useUpdateEntityDocument, useDeleteEntityDocument } from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import EntityDocumentForm from "@/components/forms/EntityDocumentForm";
import PdfViewerDialog from "@/components/contracts/PdfViewerDialog";
import { useUserRole } from "@/hooks/useUserRole";
import type { EntityDocumentFormData } from "@/lib/formSchemas";
import { Plus, Edit, Trash2, Search, Eye, FileText, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

interface DocumentsSectionProps {
  entityFilter?: string | null;
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

type SortKey = "title" | "category" | "status" | "issued_date" | "entity";
type SortDirection = "asc" | "desc";

const DocumentsSection = ({ entityFilter }: DocumentsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EntityDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<EntityDocument | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ path: string; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("issued_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");

  const { data: documents, isLoading: docsLoading } = useEntityDocuments();
  const { data: documentTypes, isLoading: typesLoading } = useDocumentTypes();
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { canWrite } = useUserRole();

  const createMutation = useCreateEntityDocument();
  const updateMutation = useUpdateEntityDocument();
  const deleteMutation = useDeleteEntityDocument();

  const getDocumentType = (typeId: string | null) => {
    if (!typeId) return null;
    return documentTypes?.find((t) => t.id === typeId);
  };

  const getEntityName = (entityId: string | null) => {
    if (!entityId) return "—";
    return entities?.find((e) => e.id === entityId)?.name || "—";
  };

  const filteredAndSortedDocuments = useMemo(() => {
    if (!documents) return [];

    let filtered = entityFilter
      ? documents.filter((d) => d.entity_id === entityFilter)
      : documents;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((d) => {
        const docType = getDocumentType(d.document_type_id);
        return docType?.category === categoryFilter;
      });
    }

    // Apply search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((d) => {
        const docType = getDocumentType(d.document_type_id);
        return (
          d.title.toLowerCase().includes(searchLower) ||
          (docType?.name || "").toLowerCase().includes(searchLower) ||
          (docType?.code || "").toLowerCase().includes(searchLower) ||
          (d.reference_number || "").toLowerCase().includes(searchLower) ||
          getEntityName(d.entity_id).toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply sort
    return [...filtered].sort((a, b) => {
      let aVal = "";
      let bVal = "";

      switch (sortKey) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "category":
          aVal = (getDocumentType(a.document_type_id)?.category || "").toLowerCase();
          bVal = (getDocumentType(b.document_type_id)?.category || "").toLowerCase();
          break;
        case "status":
          aVal = a.status.toLowerCase();
          bVal = b.status.toLowerCase();
          break;
        case "issued_date":
          aVal = a.issued_date || "";
          bVal = b.issued_date || "";
          break;
        case "entity":
          aVal = getEntityName(a.entity_id).toLowerCase();
          bVal = getEntityName(b.entity_id).toLowerCase();
          break;
      }

      if (sortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }, [documents, documentTypes, entities, entityFilter, statusFilter, categoryFilter, search, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  const handleSubmit = (data: EntityDocumentFormData) => {
    // Use selectedEntityId from the parent selector if it was changed, otherwise fall back to form data
    const effectiveEntityId = selectedEntityId !== "" 
      ? selectedEntityId 
      : data.entity_id;
    
    // Handle entity_id: use null if empty, "__none__", or not provided
    const entityId = effectiveEntityId && effectiveEntityId !== "__none__" ? effectiveEntityId : null;
    
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
        onSuccess: () => {
          setShowForm(false);
          setSelectedEntityId("");
        },
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

  const handleAddNew = () => {
    // Set selected entity if filter is applied or entities exist, otherwise allow creation without entity
    setSelectedEntityId(entityFilter || "");
    setShowForm(true);
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    documentTypes?.forEach((t) => cats.add(t.category || "Other"));
    return Array.from(cats).sort();
  }, [documentTypes]);

  if (docsLoading || typesLoading || entitiesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Documents</h2>
          <p className="text-muted-foreground">
            Manage corporate documents across entities
          </p>
        </div>
        {canWrite && (
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Document
          </Button>
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="superseded">Superseded</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center hover:text-foreground transition-colors text-foreground"
                  >
                    Title {getSortIcon("title")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("category")}
                    className="flex items-center hover:text-foreground transition-colors text-foreground"
                  >
                    Type {getSortIcon("category")}
                  </button>
                </TableHead>
                {!entityFilter && (
                  <TableHead>
                    <button
                      onClick={() => handleSort("entity")}
                      className="flex items-center hover:text-foreground transition-colors text-foreground"
                    >
                      Entity {getSortIcon("entity")}
                    </button>
                  </TableHead>
                )}
                <TableHead>
                  <button
                    onClick={() => handleSort("issued_date")}
                    className="flex items-center hover:text-foreground transition-colors text-foreground"
                  >
                    Issued {getSortIcon("issued_date")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center hover:text-foreground transition-colors text-foreground"
                  >
                    Status {getSortIcon("status")}
                  </button>
                </TableHead>
                <TableHead className="text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedDocuments.map((doc) => {
                const docType = getDocumentType(doc.document_type_id);
                const categoryColor = docType?.category
                  ? categoryColors[docType.category]
                  : categoryColors.Other;

                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{doc.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {docType ? (
                        <Badge variant="outline" className={categoryColor}>
                          {docType.code}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {!entityFilter && (
                      <TableCell className="text-foreground">
                        {getEntityName(doc.entity_id)}
                      </TableCell>
                    )}
                    <TableCell className="text-foreground">
                      {doc.issued_date
                        ? format(new Date(doc.issued_date), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[doc.status] || statusColors.current}
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {doc.file_path && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setViewingPdf({
                                path: doc.file_path!,
                                name: doc.file_name || "Document",
                              })
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {canWrite && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                            onClick={() => {
                              setEditingDocument(doc);
                              setSelectedEntityId(doc.entity_id || "__none__");
                              setShowForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canWrite && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={() => setDeletingDocument(doc)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filteredAndSortedDocuments.length && (
                <TableRow>
                  <TableCell
                    colSpan={entityFilter ? 5 : 6}
                    className="text-center text-muted-foreground py-8"
                  >
                    {search || statusFilter !== "all" || categoryFilter !== "all"
                      ? "No documents match your filters"
                      : "No documents added yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={showForm}
        onOpenChange={() => {
          setShowForm(false);
          setEditingDocument(null);
          setSelectedEntityId("");
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Edit Document" : "Add Document"}
            </DialogTitle>
          </DialogHeader>
          {!entityFilter && entities && entities.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground">Select Entity (optional)</label>
              <Select 
                value={selectedEntityId || editingDocument?.entity_id || "__none__"} 
                onValueChange={setSelectedEntityId}
              >
                <SelectTrigger className="bg-background mt-1">
                  <SelectValue placeholder="No entity selected" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="__none__">No entity</SelectItem>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <EntityDocumentForm
            entityId={selectedEntityId === "__none__" ? "" : (selectedEntityId || editingDocument?.entity_id || "")}
            document={editingDocument}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingDocument(null);
              setSelectedEntityId("");
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

export default DocumentsSection;
