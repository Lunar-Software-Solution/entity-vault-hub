import { useState } from "react";
import { Calculator, Plus, MoreVertical, Pencil, Trash2, Linkedin, Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { AccountantFirm } from "@/hooks/usePortalData";
import { useCreateAccountantFirm, useUpdateAccountantFirm, useDeleteAccountantFirm } from "@/hooks/usePortalMutations";
import AccountantFirmForm from "@/components/forms/AccountantFirmForm";
import type { AccountantFirmFormData } from "@/lib/formSchemas";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

interface LinkedAccountantFirmsProps {
  firms: AccountantFirm[];
  entityId: string;
}

const LinkedAccountantFirms = ({ firms, entityId }: LinkedAccountantFirmsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingFirm, setEditingFirm] = useState<AccountantFirm | null>(null);
  const [deletingFirm, setDeletingFirm] = useState<AccountantFirm | null>(null);

  const createMutation = useCreateAccountantFirm();
  const updateMutation = useUpdateAccountantFirm();
  const deleteMutation = useDeleteAccountantFirm();

  const handleSubmit = (data: AccountantFirmFormData) => {
    const payload = {
      ...data,
      engagement_start_date: data.engagement_start_date || null,
      engagement_end_date: data.engagement_end_date || null,
      contact_name: data.contact_name || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      linkedin_url: data.linkedin_url || null,
      address: data.address || null,
      license_number: data.license_number || null,
      fee_structure: data.fee_structure || null,
      notes: data.notes || null,
    };

    if (editingFirm) {
      updateMutation.mutate({ id: editingFirm.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (firm: AccountantFirm) => {
    setEditingFirm(firm);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingFirm) {
      deleteMutation.mutate(deletingFirm.id, {
        onSuccess: () => setDeletingFirm(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFirm(null);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Accountant Firms</h3>
          <Badge variant="secondary">{firms.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {firms.length === 0 ? (
        <p className="text-muted-foreground text-sm">No accountant firms linked.</p>
      ) : (
        <div className="space-y-3">
          {firms.map((firm) => (
            <div key={firm.id} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{firm.name}</h4>
                    <Badge variant={firm.is_active ? "default" : "secondary"}>
                      {firm.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {firm.contact_name && (
                    <p className="text-sm text-muted-foreground">{firm.contact_name}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(firm)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingFirm(firm)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {firm.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{firm.email}</span>
                  </div>
                )}
                {firm.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{firm.phone}</span>
                  </div>
                )}
                {firm.linkedin_url && (
                  <a
                    href={firm.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>View LinkedIn</span>
                  </a>
                )}
                {(firm.engagement_start_date || firm.engagement_end_date) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {firm.engagement_start_date && format(new Date(firm.engagement_start_date), "MMM yyyy")}
                      {firm.engagement_start_date && " - "}
                      {firm.engagement_end_date ? format(new Date(firm.engagement_end_date), "MMM yyyy") : "Present"}
                    </span>
                  </div>
                )}
              </div>

              {firm.specializations && firm.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {firm.specializations.map((spec) => (
                    <Badge key={spec} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFirm ? "Edit" : "Add"} Accountant Firm</DialogTitle>
          </DialogHeader>
          <AccountantFirmForm
            firm={editingFirm ?? undefined}
            entityId={entityId}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingFirm}
        onOpenChange={(open) => !open && setDeletingFirm(null)}
        onConfirm={handleDelete}
        title="Delete Accountant Firm"
        description={`Are you sure you want to delete "${deletingFirm?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedAccountantFirms;
