import { useState } from "react";
import { ClipboardCheck, Plus, MoreVertical, Pencil, Trash2, Linkedin, Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { Auditor } from "@/hooks/usePortalData";
import { useCreateAuditor, useUpdateAuditor, useDeleteAuditor } from "@/hooks/usePortalMutations";
import AuditorForm from "@/components/forms/AuditorForm";
import type { AuditorFormData } from "@/lib/formSchemas";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

interface LinkedAuditorsProps {
  auditors: Auditor[];
  entityId: string;
}

const LinkedAuditors = ({ auditors, entityId }: LinkedAuditorsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAuditor, setEditingAuditor] = useState<Auditor | null>(null);
  const [deletingAuditor, setDeletingAuditor] = useState<Auditor | null>(null);

  const createMutation = useCreateAuditor();
  const updateMutation = useUpdateAuditor();
  const deleteMutation = useDeleteAuditor();

  const handleSubmit = (data: AuditorFormData) => {
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

    if (editingAuditor) {
      updateMutation.mutate({ id: editingAuditor.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (auditor: Auditor) => {
    setEditingAuditor(auditor);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingAuditor) {
      deleteMutation.mutate(deletingAuditor.id, {
        onSuccess: () => setDeletingAuditor(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAuditor(null);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Auditors</h3>
          <Badge variant="secondary">{auditors.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {auditors.length === 0 ? (
        <p className="text-muted-foreground text-sm">No auditors linked.</p>
      ) : (
        <div className="space-y-3">
          {auditors.map((auditor) => (
            <div key={auditor.id} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{auditor.name}</h4>
                    <Badge variant={auditor.is_active ? "default" : "secondary"}>
                      {auditor.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {auditor.contact_name && (
                    <p className="text-sm text-muted-foreground">{auditor.contact_name}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(auditor)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingAuditor(auditor)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {auditor.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{auditor.email}</span>
                  </div>
                )}
                {auditor.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{auditor.phone}</span>
                  </div>
                )}
                {auditor.linkedin_url && (
                  <a
                    href={auditor.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>View LinkedIn</span>
                  </a>
                )}
                {(auditor.engagement_start_date || auditor.engagement_end_date) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {auditor.engagement_start_date && format(new Date(auditor.engagement_start_date), "MMM yyyy")}
                      {auditor.engagement_start_date && " - "}
                      {auditor.engagement_end_date ? format(new Date(auditor.engagement_end_date), "MMM yyyy") : "Present"}
                    </span>
                  </div>
                )}
              </div>

              {auditor.audit_types && auditor.audit_types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {auditor.audit_types.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}

              {auditor.certifications && auditor.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {auditor.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      {cert}
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
            <DialogTitle>{editingAuditor ? "Edit" : "Add"} Auditor</DialogTitle>
          </DialogHeader>
          <AuditorForm
            auditor={editingAuditor ?? undefined}
            entityId={entityId}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingAuditor}
        onOpenChange={(open) => !open && setDeletingAuditor(null)}
        onConfirm={handleDelete}
        title="Delete Auditor"
        description={`Are you sure you want to delete "${deletingAuditor?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedAuditors;
