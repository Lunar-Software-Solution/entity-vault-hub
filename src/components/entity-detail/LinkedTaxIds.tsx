import { useState } from "react";
import { FileText, Star, Plus, MoreHorizontal, Edit, Trash2, Globe, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import TaxIdForm from "@/components/forms/TaxIdForm";
import { useCreateTaxId, useUpdateTaxId, useDeleteTaxId } from "@/hooks/usePortalMutations";
import { format } from "date-fns";
import type { TaxId } from "@/hooks/usePortalData";
import type { TaxIdFormData } from "@/lib/formSchemas";

interface LinkedTaxIdsProps {
  taxIds: TaxId[];
  entityId: string;
}

const LinkedTaxIds = ({ taxIds, entityId }: LinkedTaxIdsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState<TaxId | null>(null);
  const [deletingTaxId, setDeletingTaxId] = useState<TaxId | null>(null);

  const createMutation = useCreateTaxId();
  const updateMutation = useUpdateTaxId();
  const deleteMutation = useDeleteTaxId();

  const handleSubmit = (data: TaxIdFormData) => {
    const payload = {
      ...data,
      authority: data.authority || null,
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

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Tax IDs</h3>
          <Badge variant="secondary" className="text-xs">{taxIds.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {taxIds.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tax IDs linked</p>
      ) : (
        <div className="space-y-3">
          {taxIds.map((taxId) => (
            <div key={taxId.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{taxId.type}</Badge>
                    {taxId.is_primary && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <p className="text-sm font-mono text-foreground">{taxId.tax_id_number}</p>
                  {taxId.authority && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span>{taxId.authority}</span>
                    </div>
                  )}
                  {taxId.issued_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Issued: {format(new Date(taxId.issued_date), "MMM yyyy")}
                        {taxId.expiry_date && ` • Exp: ${format(new Date(taxId.expiry_date), "MMM yyyy")}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
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
            defaultEntityId={entityId}
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
        description={`Are you sure you want to delete "${deletingTaxId?.type}: ${deletingTaxId?.tax_id_number}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedTaxIds;
