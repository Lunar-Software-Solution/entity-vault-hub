import { useState } from "react";
import { useTaxIds, useEntities, type TaxId } from "@/hooks/usePortalData";
import { useCreateTaxId, useUpdateTaxId, useDeleteTaxId } from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import TaxIdForm from "@/components/forms/TaxIdForm";
import { FileText, Plus, MoreHorizontal, Edit, Trash2, Star, Building2, Globe, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";
import type { TaxIdFormData } from "@/lib/formSchemas";

interface TaxIdsSectionProps {
  entityFilter?: string | null;
}

const TaxIdsSection = ({ entityFilter }: TaxIdsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState<TaxId | null>(null);
  const [deletingTaxId, setDeletingTaxId] = useState<TaxId | null>(null);

  const { data: taxIds, isLoading: taxIdsLoading } = useTaxIds();
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { canWrite } = useUserRole();
  
  const createMutation = useCreateTaxId();
  const updateMutation = useUpdateTaxId();
  const deleteMutation = useDeleteTaxId();

  const isLoading = taxIdsLoading || entitiesLoading;

  const filteredTaxIds = entityFilter
    ? taxIds?.filter(t => t.entity_id === entityFilter)
    : taxIds;

  const getEntityName = (entityId: string) => {
    return entities?.find(e => e.id === entityId)?.name ?? "Unknown Entity";
  };

  const handleSubmit = (data: TaxIdFormData) => {
    const payload = {
      ...data,
      issued_date: data.issued_date || null,
      expiry_date: data.expiry_date || null,
      notes: data.notes || null,
    };

    if (editingTaxId) {
      updateMutation.mutate({ id: editingTaxId.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (taxId: TaxId) => {
    setEditingTaxId(taxId);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingTaxId) {
      deleteMutation.mutate(deletingTaxId.id, {
        onSuccess: () => setDeletingTaxId(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTaxId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tax IDs</h2>
          <p className="text-muted-foreground">Manage tax identifiers for your entities</p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Tax ID
          </Button>
        )}
      </div>

      {!filteredTaxIds?.length ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No tax IDs added yet</p>
          {canWrite && (
            <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Tax ID
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTaxIds.map((taxId) => (
            <div key={taxId.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{taxId.type}</Badge>
                      {taxId.is_primary && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-lg font-mono text-foreground mt-1">
                      {taxId.tax_id_number}
                    </p>
                  </div>
                </div>
                {canWrite && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(taxId)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingTaxId(taxId)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{getEntityName(taxId.entity_id)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span>{taxId.country} — {taxId.authority}</span>
                </div>
                {taxId.issued_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Issued: {format(new Date(taxId.issued_date), "MMM d, yyyy")}
                      {taxId.expiry_date && ` • Expires: ${format(new Date(taxId.expiry_date), "MMM d, yyyy")}`}
                    </span>
                  </div>
                )}
                {taxId.notes && (
                  <p className="text-xs text-muted-foreground italic truncate">{taxId.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTaxId ? "Edit Tax ID" : "Add Tax ID"}
            </DialogTitle>
          </DialogHeader>
          <TaxIdForm
            taxId={editingTaxId}
            defaultEntityId={entityFilter ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingTaxId}
        onOpenChange={() => setDeletingTaxId(null)}
        onConfirm={handleDelete}
        title="Delete Tax ID"
        description={`Are you sure you want to delete "${deletingTaxId?.type}: ${deletingTaxId?.tax_id_number}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default TaxIdsSection;
