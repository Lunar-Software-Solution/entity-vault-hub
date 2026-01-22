import { useState } from "react";
import { Lightbulb, Plus, MoreVertical, Pencil, Trash2, Linkedin, Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { Advisor } from "@/hooks/usePortalData";
import { useCreateAdvisor, useUpdateAdvisor, useDeleteAdvisor } from "@/hooks/usePortalMutations";
import AdvisorForm from "@/components/forms/AdvisorForm";
import type { AdvisorFormData } from "@/lib/formSchemas";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

interface LinkedAdvisorsProps {
  advisors: Advisor[];
  entityId: string;
}

const LinkedAdvisors = ({ advisors, entityId }: LinkedAdvisorsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [deletingAdvisor, setDeletingAdvisor] = useState<Advisor | null>(null);

  const createMutation = useCreateAdvisor();
  const updateMutation = useUpdateAdvisor();
  const deleteMutation = useDeleteAdvisor();

  const handleSubmit = (data: AdvisorFormData) => {
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
      advisor_type: data.advisor_type || null,
      fee_structure: data.fee_structure || null,
      notes: data.notes || null,
    };

    if (editingAdvisor) {
      updateMutation.mutate({ id: editingAdvisor.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (advisor: Advisor) => {
    setEditingAdvisor(advisor);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingAdvisor) {
      deleteMutation.mutate(deletingAdvisor.id, {
        onSuccess: () => setDeletingAdvisor(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAdvisor(null);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Advisors</h3>
          <Badge variant="secondary">{advisors.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {advisors.length === 0 ? (
        <p className="text-muted-foreground text-sm">No advisors linked.</p>
      ) : (
        <div className="space-y-3">
          {advisors.map((advisor) => (
            <div key={advisor.id} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{advisor.name}</h4>
                    <Badge variant={advisor.is_active ? "default" : "secondary"}>
                      {advisor.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {advisor.advisor_type && (
                    <p className="text-sm text-muted-foreground">{advisor.advisor_type}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(advisor)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingAdvisor(advisor)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {advisor.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{advisor.email}</span>
                  </div>
                )}
                {advisor.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{advisor.phone}</span>
                  </div>
                )}
                {advisor.linkedin_url && (
                  <a
                    href={advisor.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>View LinkedIn</span>
                  </a>
                )}
                {(advisor.engagement_start_date || advisor.engagement_end_date) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {advisor.engagement_start_date && format(new Date(advisor.engagement_start_date), "MMM yyyy")}
                      {advisor.engagement_start_date && " - "}
                      {advisor.engagement_end_date ? format(new Date(advisor.engagement_end_date), "MMM yyyy") : "Present"}
                    </span>
                  </div>
                )}
              </div>

              {advisor.certifications && advisor.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {advisor.certifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
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
            <DialogTitle>{editingAdvisor ? "Edit" : "Add"} Advisor</DialogTitle>
          </DialogHeader>
          <AdvisorForm
            advisor={editingAdvisor ?? undefined}
            entityId={entityId}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingAdvisor}
        onOpenChange={(open) => !open && setDeletingAdvisor(null)}
        onConfirm={handleDelete}
        title="Delete Advisor"
        description={`Are you sure you want to delete "${deletingAdvisor?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedAdvisors;
