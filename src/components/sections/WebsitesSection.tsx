import { useState, useMemo } from "react";
import { Plus, ExternalLink, MoreVertical, Pencil, Trash2, Building2, Calendar, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEntityWebsites, useEntities, type EntityWebsite } from "@/hooks/usePortalData";
import { useCreateEntityWebsite, useUpdateEntityWebsite, useDeleteEntityWebsite } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import WebsiteForm from "@/components/forms/WebsiteForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import CompanyLogo from "@/components/shared/CompanyLogo";
import { useUserRole } from "@/hooks/useUserRole";
import type { EntityWebsiteFormData } from "@/lib/formSchemas";
import { format, differenceInDays, parseISO } from "date-fns";

interface WebsitesSectionProps {
  entityFilter?: string | null;
}

const WebsitesSection = ({ entityFilter }: WebsitesSectionProps) => {
  const { data: websites, isLoading } = useEntityWebsites();
  const { data: entities } = useEntities();
  const { canWrite } = useUserRole();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<EntityWebsite | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const createWebsite = useCreateEntityWebsite();
  const updateWebsite = useUpdateEntityWebsite();
  const deleteWebsite = useDeleteEntityWebsite();

  // Filter websites by entity if filter is set
  const filteredWebsites = useMemo(() => {
    if (!websites) return [];
    if (!entityFilter) return websites;
    return websites.filter(website => website.entity_id === entityFilter);
  }, [websites, entityFilter]);

  // Get entity name by ID
  const getEntityName = (entityId: string | null) => {
    if (!entityId || !entities) return null;
    return entities.find(e => e.id === entityId)?.name || null;
  };

  // Check if a date is expiring soon (within 30 days)
  const isExpiringSoon = (dateStr: string | null) => {
    if (!dateStr) return false;
    const days = differenceInDays(parseISO(dateStr), new Date());
    return days >= 0 && days <= 30;
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return differenceInDays(parseISO(dateStr), new Date()) < 0;
  };

  const handleSubmit = (data: EntityWebsiteFormData) => {
    const cleanData = {
      entity_id: data.entity_id,
      name: data.name,
      url: data.url,
      type: data.type || "corporate",
      platform: data.platform || null,
      notes: data.notes || null,
      domain_expiry_date: data.domain_expiry_date || null,
      ssl_expiry_date: data.ssl_expiry_date || null,
      is_primary: data.is_primary ?? false,
      is_active: data.is_active ?? true,
    };
    
    if (editingWebsite) {
      updateWebsite.mutate({ id: editingWebsite.id, ...cleanData }, { 
        onSuccess: () => { setIsFormOpen(false); setEditingWebsite(null); }
      });
    } else {
      createWebsite.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleEdit = (website: EntityWebsite) => {
    setEditingWebsite(website);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteWebsite.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingWebsite(null);
  };

  const websiteTypeLabels: Record<string, string> = {
    corporate: "Corporate",
    ecommerce: "E-Commerce",
    landing: "Landing Page",
    blog: "Blog",
    portal: "Portal",
    documentation: "Documentation",
    other: "Other",
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Websites</h2>
          <p className="text-muted-foreground">Manage websites and domains across all entities.</p>
        </div>
        {canWrite && (
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Website
          </Button>
        )}
      </div>

      {filteredWebsites.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {entityFilter ? "No websites linked to this entity." : "No websites added yet."}
          </p>
          {canWrite && (
            <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Website
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWebsites.map((website) => {
            const entityName = getEntityName(website.entity_id);
            const domainExpiringSoon = isExpiringSoon(website.domain_expiry_date);
            const domainExpired = isExpired(website.domain_expiry_date);
            const sslExpiringSoon = isExpiringSoon(website.ssl_expiry_date);
            const sslExpired = isExpired(website.ssl_expiry_date);
            const hasWarning = domainExpiringSoon || domainExpired || sslExpiringSoon || sslExpired;
            
            return (
              <div key={website.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo 
                      domain={website.url} 
                      name={website.name} 
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{website.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{website.url}</p>
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
                        <DropdownMenuItem onClick={() => handleEdit(website)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingId(website.id)}
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
                    <Badge variant="outline">{websiteTypeLabels[website.type] || website.type}</Badge>
                    {website.is_primary && <Badge variant="secondary">Primary</Badge>}
                    {website.is_active === false && <Badge variant="destructive">Inactive</Badge>}
                    {website.platform && <Badge variant="outline" className="text-muted-foreground">{website.platform}</Badge>}
                  </div>

                  {entityName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate">{entityName}</span>
                    </div>
                  )}

                  {/* Domain Expiry */}
                  {website.domain_expiry_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className={domainExpired ? "text-destructive" : domainExpiringSoon ? "text-warning" : "text-muted-foreground"}>
                        Domain: {format(parseISO(website.domain_expiry_date), "MMM d, yyyy")}
                      </span>
                      {domainExpired && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                      {domainExpiringSoon && !domainExpired && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                    </div>
                  )}

                  {/* SSL Expiry */}
                  {website.ssl_expiry_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className={sslExpired ? "text-destructive" : sslExpiringSoon ? "text-warning" : "text-muted-foreground"}>
                        SSL: {format(parseISO(website.ssl_expiry_date), "MMM d, yyyy")}
                      </span>
                      {sslExpired && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                      {sslExpiringSoon && !sslExpired && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Visit Website
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWebsite ? "Edit Website" : "Add Website"}</DialogTitle>
          </DialogHeader>
          <WebsiteForm
            website={editingWebsite}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createWebsite.isPending || updateWebsite.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Website"
        description="Are you sure you want to delete this website? This action cannot be undone."
        isLoading={deleteWebsite.isPending}
      />
    </div>
  );
};

export default WebsitesSection;
