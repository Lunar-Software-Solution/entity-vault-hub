import { useState } from "react";
import { Briefcase, Plus, MoreVertical, Pencil, Trash2, Linkedin, Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { Consultant } from "@/hooks/usePortalData";
import { useCreateConsultant, useUpdateConsultant, useDeleteConsultant } from "@/hooks/usePortalMutations";
import ConsultantForm from "@/components/forms/ConsultantForm";
import type { ConsultantFormData } from "@/lib/formSchemas";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

interface LinkedConsultantsProps {
  consultants: Consultant[];
  entityId: string;
}

const LinkedConsultants = ({ consultants, entityId }: LinkedConsultantsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);
  const [deletingConsultant, setDeletingConsultant] = useState<Consultant | null>(null);

  const createMutation = useCreateConsultant();
  const updateMutation = useUpdateConsultant();
  const deleteMutation = useDeleteConsultant();

  const handleSubmit = (data: ConsultantFormData) => {
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
      consultant_type: data.consultant_type || null,
      project_scope: data.project_scope || null,
      fee_structure: data.fee_structure || null,
      notes: data.notes || null,
    };

    if (editingConsultant) {
      updateMutation.mutate({ id: editingConsultant.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingConsultant) {
      deleteMutation.mutate(deletingConsultant.id, {
        onSuccess: () => setDeletingConsultant(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingConsultant(null);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Consultants</h3>
          <Badge variant="secondary">{consultants.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {consultants.length === 0 ? (
        <p className="text-muted-foreground text-sm">No consultants linked.</p>
      ) : (
        <div className="space-y-3">
          {consultants.map((consultant) => (
            <div key={consultant.id} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{consultant.name}</h4>
                    <Badge variant={consultant.is_active ? "default" : "secondary"}>
                      {consultant.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {consultant.consultant_type && (
                    <p className="text-sm text-muted-foreground">{consultant.consultant_type}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(consultant)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingConsultant(consultant)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {consultant.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{consultant.email}</span>
                  </div>
                )}
                {consultant.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{consultant.phone}</span>
                  </div>
                )}
                {consultant.linkedin_url && (
                  <a
                    href={consultant.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>View LinkedIn</span>
                  </a>
                )}
                {(consultant.engagement_start_date || consultant.engagement_end_date) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {consultant.engagement_start_date && format(new Date(consultant.engagement_start_date), "MMM yyyy")}
                      {consultant.engagement_start_date && " - "}
                      {consultant.engagement_end_date ? format(new Date(consultant.engagement_end_date), "MMM yyyy") : "Present"}
                    </span>
                  </div>
                )}
              </div>

              {consultant.project_scope && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{consultant.project_scope}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingConsultant ? "Edit" : "Add"} Consultant</DialogTitle>
          </DialogHeader>
          <ConsultantForm
            consultant={editingConsultant ?? undefined}
            entityId={entityId}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingConsultant}
        onOpenChange={(open) => !open && setDeletingConsultant(null)}
        onConfirm={handleDelete}
        title="Delete Consultant"
        description={`Are you sure you want to delete "${deletingConsultant?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedConsultants;
