import { useState, useMemo } from "react";
import { Plus, ExternalLink, MoreVertical, Pencil, Trash2, Building2, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEntitySoftware, useEntities, useSoftwareCatalog } from "@/hooks/usePortalData";
import { useCreateEntitySoftware, useUpdateEntitySoftware, useDeleteEntitySoftware } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import EntitySoftwareForm from "@/components/forms/EntitySoftwareForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import CompanyLogo from "@/components/shared/CompanyLogo";
import { useUserRole } from "@/hooks/useUserRole";
import type { EntitySoftwareFormData } from "@/lib/formSchemas";
import { format, differenceInDays, parseISO } from "date-fns";

interface SoftwareSectionProps {
  entityFilter?: string | null;
}

const SoftwareSection = ({ entityFilter }: SoftwareSectionProps) => {
  const { data: entitySoftware, isLoading } = useEntitySoftware();
  const { data: entities } = useEntities();
  const { data: softwareCatalog } = useSoftwareCatalog();
  const { canWrite } = useUserRole();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const createSoftware = useCreateEntitySoftware();
  const updateSoftware = useUpdateEntitySoftware();
  const deleteSoftware = useDeleteEntitySoftware();

  // Filter software by entity if filter is set
  const filteredSoftware = useMemo(() => {
    if (!entitySoftware) return [];
    if (!entityFilter) return entitySoftware;
    return entitySoftware.filter(sw => sw.entity_id === entityFilter);
  }, [entitySoftware, entityFilter]);

  // Get entity name by ID
  const getEntityName = (entityId: string | null) => {
    if (!entityId || !entities) return null;
    return entities.find(e => e.id === entityId)?.name || null;
  };

  // Check if license is expiring soon (within 30 days)
  const isExpiringSoon = (dateStr: string | null) => {
    if (!dateStr) return false;
    const days = differenceInDays(parseISO(dateStr), new Date());
    return days >= 0 && days <= 30;
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return differenceInDays(parseISO(dateStr), new Date()) < 0;
  };

  const categoryLabels: Record<string, string> = {
    erp: "ERP System",
    accounting: "Accounting",
    payroll: "Payroll",
    hr: "HR Management",
    crm: "CRM",
    bi: "Business Intelligence",
    project_management: "Project Management",
    communication: "Communication",
    document_management: "Document Management",
    other: "Other",
  };

  const handleSubmit = (data: EntitySoftwareFormData) => {
    const cleanData = {
      entity_id: data.entity_id,
      software_id: data.software_id || null,
      custom_name: data.custom_name || null,
      category: data.category || "other",
      login_url: data.login_url || null,
      account_email: data.account_email || null,
      license_type: data.license_type || null,
      license_expiry_date: data.license_expiry_date || null,
      is_active: data.is_active ?? true,
      notes: data.notes || null,
    };
    
    if (editingSoftware) {
      updateSoftware.mutate({ id: editingSoftware.id, ...cleanData }, { 
        onSuccess: () => { setIsFormOpen(false); setEditingSoftware(null); }
      });
    } else {
      createSoftware.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleEdit = (software: any) => {
    setEditingSoftware(software);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteSoftware.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSoftware(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Software & Systems</h2>
          <p className="text-muted-foreground">Manage software and systems across all entities.</p>
        </div>
        {canWrite && (
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Software
          </Button>
        )}
      </div>

      {filteredSoftware.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {entityFilter ? "No software linked to this entity." : "No software added yet."}
          </p>
          {canWrite && (
            <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Software
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSoftware.map((software) => {
            const entityName = getEntityName(software.entity_id);
            const catalogItem = software.software_catalog;
            const displayName = software.custom_name || catalogItem?.name || "Unknown Software";
            const licenseExpiringSoon = isExpiringSoon(software.license_expiry_date);
            const licenseExpired = isExpired(software.license_expiry_date);
            // Use login_url first, then catalog website for logo
            const logoUrl = software.login_url || catalogItem?.website;
            
            return (
              <div key={software.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo 
                      domain={logoUrl} 
                      name={displayName} 
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{displayName}</h3>
                      {catalogItem?.vendor && (
                        <p className="text-sm text-muted-foreground truncate">{catalogItem.vendor}</p>
                      )}
                    </div>
                  </div>
                  {canWrite && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border border-border">
                        <DropdownMenuItem onClick={() => handleEdit(software)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingId(software.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{categoryLabels[software.category] || software.category}</Badge>
                    {software.license_type && <Badge variant="secondary">{software.license_type}</Badge>}
                    {software.is_active === false && <Badge variant="destructive">Inactive</Badge>}
                  </div>

                  {entityName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate">{entityName}</span>
                    </div>
                  )}

                  {software.account_email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{software.account_email}</span>
                    </div>
                  )}

                  {/* License Expiry */}
                  {software.license_expiry_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className={licenseExpired ? "text-destructive" : licenseExpiringSoon ? "text-warning" : "text-muted-foreground"}>
                        License: {format(parseISO(software.license_expiry_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                {software.login_url && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <a
                      href={software.login_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Login
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSoftware ? "Edit Software" : "Add Software"}</DialogTitle>
          </DialogHeader>
          <EntitySoftwareForm
            software={editingSoftware}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createSoftware.isPending || updateSoftware.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Software"
        description="Are you sure you want to delete this software? This action cannot be undone."
        isLoading={deleteSoftware.isPending}
      />
    </div>
  );
};

export default SoftwareSection;
