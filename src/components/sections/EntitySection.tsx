import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanyLogo from "@/components/shared/CompanyLogo";
import { useEntities } from "@/hooks/usePortalData";
import { useCreateEntity, useUpdateEntity, useDeleteEntity } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EntityForm from "@/components/forms/EntityForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useUserRole } from "@/hooks/useUserRole";
import type { EntityFormData } from "@/lib/formSchemas";
import type { Entity } from "@/hooks/usePortalData";

const EntitySection = () => {
  const navigate = useNavigate();
  const { data: entities, isLoading } = useEntities();
  const { canWrite } = useUserRole();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [deletingEntity, setDeletingEntity] = useState<Entity | null>(null);
  
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();

  const handleSubmit = (data: EntityFormData) => {
    const cleanData = {
      name: data.name,
      type: data.type,
      status: data.status,
      website: data.website || null,
      jurisdiction: data.jurisdiction || null,
      founded_date: data.founded_date || null,
      fiscal_year_end: data.fiscal_year_end || null,
      description_of_activities: data.description_of_activities || null,
    };
    
    if (editingEntity) {
      updateEntity.mutate({ id: editingEntity.id, ...cleanData }, { 
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingEntity(null);
        }
      });
    } else {
      createEntity.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deletingEntity) {
      deleteEntity.mutate(deletingEntity.id, { 
        onSuccess: () => setDeletingEntity(null) 
      });
    }
  };

  const handleAddNew = () => {
    setEditingEntity(null);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Entities</h2>
          <p className="text-muted-foreground">Manage your business or personal entities.</p>
        </div>
        {canWrite && (
          <Button className="gap-2" onClick={handleAddNew}>
            <Plus className="w-4 h-4" />
            Add Entity
          </Button>
        )}
      </div>

      {!entities || entities.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No entities registered yet.</p>
          {canWrite && (
            <Button className="gap-2" onClick={handleAddNew}>
              <Plus className="w-4 h-4" />
              Register Your First Entity
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {entities.map((entity) => (
            <div
              key={entity.id}
              onClick={() => navigate(`/entity/${entity.id}`)}
              className="glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              <CompanyLogo 
                domain={(entity as any).website}
                name={entity.name} 
                size="md"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{entity.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    entity.status === "Active" 
                      ? "bg-success/10 text-success" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {entity.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{entity.type}</span>
                  {entity.jurisdiction && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {entity.jurisdiction}
                    </span>
                  )}
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntity ? "Edit Entity" : "Register Entity"}</DialogTitle>
          </DialogHeader>
          <EntityForm
            entity={editingEntity || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingEntity(null);
            }}
            isLoading={createEntity.isPending || updateEntity.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingEntity}
        onOpenChange={(open) => !open && setDeletingEntity(null)}
        onConfirm={handleDelete}
        title="Delete Entity"
        description="You must remove or reassign all linked items before the entity can be deleted."
        isLoading={deleteEntity.isPending}
      />
    </div>
  );
};

export default EntitySection;
