import { useState } from "react";
import { Building2, Calendar, MapPin, Mail, Phone, Globe, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEntities } from "@/hooks/usePortalData";
import { useCreateEntity, useUpdateEntity, useDeleteEntity } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EntityForm from "@/components/forms/EntityForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { format } from "date-fns";
import type { EntityFormData } from "@/lib/formSchemas";

const EntitySection = () => {
  const { data: entities, isLoading } = useEntities();
  const entity = entities?.[0];
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();

  const handleSubmit = (data: EntityFormData) => {
    const cleanData = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      jurisdiction: data.jurisdiction || null,
      founded_date: data.founded_date || null,
      ein_tax_id: data.ein_tax_id || null,
      registration_number: data.registration_number || null,
      duns_number: data.duns_number || null,
    };
    
    if (entity) {
      updateEntity.mutate({ id: entity.id, ...cleanData }, { onSuccess: () => setIsFormOpen(false) });
    } else {
      createEntity.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (entity) {
      deleteEntity.mutate(entity.id, { onSuccess: () => setIsDeleteOpen(false) });
    }
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
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Entity Details</h2>
          <p className="text-muted-foreground">Manage your business or personal entity information.</p>
        </div>
        {entity ? (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
              <Edit className="w-4 h-4" />
              Edit Entity
            </Button>
          </div>
        ) : (
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Register Your Entity
          </Button>
        )}
      </div>

      {!entity ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No entity registered yet.</p>
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Register Your Entity
          </Button>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
              <Building2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">{entity.name}</h3>
              <p className="text-muted-foreground">{entity.type}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  entity.status === "Active" 
                    ? "bg-success/10 text-success" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {entity.status}
                </span>
                {entity.is_verified && (
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">Verified</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Registration</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Founded</p>
                    <p className="text-foreground font-medium">
                      {entity.founded_date 
                        ? format(new Date(entity.founded_date), "MMMM d, yyyy")
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Jurisdiction</p>
                    <p className="text-foreground font-medium">{entity.jurisdiction || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground font-medium">{entity.email || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground font-medium">{entity.phone || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <p className="text-foreground font-medium">{entity.website || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Identification Numbers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">EIN / Tax ID</p>
                <p className="font-mono text-foreground">{entity.ein_tax_id || "XX-XXXXXXX"}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Registration Number</p>
                <p className="font-mono text-foreground">{entity.registration_number || "Not specified"}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">DUNS Number</p>
                <p className="font-mono text-foreground">{entity.duns_number || "XX-XXX-XXXX"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{entity ? "Edit Entity" : "Register Entity"}</DialogTitle>
          </DialogHeader>
          <EntityForm
            entity={entity}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createEntity.isPending || updateEntity.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Entity"
        description="This will permanently delete this entity and all associated information."
        isLoading={deleteEntity.isPending}
      />
    </div>
  );
};

export default EntitySection;
