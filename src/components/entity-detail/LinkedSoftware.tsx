import { useState } from "react";
import { Monitor, Plus, MoreHorizontal, Edit, Trash2, ExternalLink, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import EntitySoftwareForm, { categoryLabels } from "@/components/forms/EntitySoftwareForm";
import { useCreateEntitySoftware, useUpdateEntitySoftware, useDeleteEntitySoftware } from "@/hooks/usePortalMutations";
import type { EntitySoftware, SoftwareCatalog } from "@/hooks/usePortalData";
import type { EntitySoftwareFormData } from "@/lib/formSchemas";
import { useUserRole } from "@/hooks/useUserRole";

interface LinkedSoftwareProps {
  software: (EntitySoftware & { software_catalog?: SoftwareCatalog | null })[];
  entityId: string;
}

const LinkedSoftware = ({ software, entityId }: LinkedSoftwareProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<EntitySoftware | null>(null);
  const [deletingSoftware, setDeletingSoftware] = useState<EntitySoftware | null>(null);
  const { canWrite } = useUserRole();

  const createMutation = useCreateEntitySoftware();
  const updateMutation = useUpdateEntitySoftware();
  const deleteMutation = useDeleteEntitySoftware();

  const handleSubmit = (data: EntitySoftwareFormData) => {
    const payload = {
      entity_id: data.entity_id,
      software_id: data.software_id || null,
      custom_name: data.custom_name || null,
      category: data.category,
      login_url: data.login_url || null,
      account_email: data.account_email || null,
      notes: data.notes || null,
      is_active: data.is_active,
      license_type: data.license_type || null,
      license_expiry_date: data.license_expiry_date || null,
    };

    if (editingSoftware) {
      updateMutation.mutate({ id: editingSoftware.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (sw: EntitySoftware) => {
    setEditingSoftware(sw);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingSoftware) {
      deleteMutation.mutate(deletingSoftware.id, {
        onSuccess: () => setDeletingSoftware(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSoftware(null);
  };

  const getSoftwareName = (sw: EntitySoftware & { software_catalog?: SoftwareCatalog | null }) => {
    return sw.software_catalog?.name || sw.custom_name || "Unknown";
  };

  const getVendor = (sw: EntitySoftware & { software_catalog?: SoftwareCatalog | null }) => {
    return sw.software_catalog?.vendor || null;
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Software & Systems</h3>
          <Badge variant="secondary" className="text-xs">{software.length}</Badge>
        </div>
        {canWrite && (
          <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        )}
      </div>

      {software.length === 0 ? (
        <p className="text-sm text-muted-foreground">No software linked</p>
      ) : (
        <div className="space-y-3">
          {software.map((sw) => (
            <div key={sw.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{getSoftwareName(sw)}</span>
                    {getVendor(sw) && (
                      <span className="text-xs text-muted-foreground">by {getVendor(sw)}</span>
                    )}
                    {!sw.is_active && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[sw.category] || sw.category}
                    </Badge>
                    {sw.license_type && (
                      <span className="text-xs text-muted-foreground">{sw.license_type}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    {sw.login_url && (
                      <a 
                        href={sw.login_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Login
                      </a>
                    )}
                    {sw.account_email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {sw.account_email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {canWrite && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(sw)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeletingSoftware(sw)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSoftware ? "Edit Software" : "Add Software"}
            </DialogTitle>
          </DialogHeader>
          <EntitySoftwareForm
            software={editingSoftware}
            defaultEntityId={entityId}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingSoftware}
        onOpenChange={() => setDeletingSoftware(null)}
        onConfirm={handleDelete}
        title="Delete Software"
        description={`Are you sure you want to delete this software entry?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedSoftware;
