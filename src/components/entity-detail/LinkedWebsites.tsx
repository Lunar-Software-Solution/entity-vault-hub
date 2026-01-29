import { useState } from "react";
import { Globe, Star, Plus, MoreHorizontal, Edit, Trash2, ExternalLink, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import WebsiteForm from "@/components/forms/WebsiteForm";
import { useCreateEntityWebsite, useUpdateEntityWebsite, useDeleteEntityWebsite } from "@/hooks/usePortalMutations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { EntityWebsite } from "@/hooks/usePortalData";
import type { EntityWebsiteFormData } from "@/lib/formSchemas";
import { useUserRole } from "@/hooks/useUserRole";

interface LinkedWebsitesProps {
  entityId: string;
}

interface WebsiteEntityLink {
  id: string;
  website_id: string;
  is_primary: boolean;
  website?: EntityWebsite;
}

const typeLabels: Record<string, string> = {
  corporate: "Corporate",
  ecommerce: "E-Commerce",
  marketing: "Marketing",
  landing: "Landing Page",
  blog: "Blog",
  support: "Support Portal",
  documentation: "Documentation",
  app: "Web App",
  other: "Other",
};

const platformLabels: Record<string, string> = {
  wordpress: "WordPress",
  shopify: "Shopify",
  squarespace: "Squarespace",
  wix: "Wix",
  webflow: "Webflow",
  magento: "Magento",
  woocommerce: "WooCommerce",
  bigcommerce: "BigCommerce",
  hubspot: "HubSpot",
  ghost: "Ghost",
  drupal: "Drupal",
  joomla: "Joomla",
  custom: "Custom Built",
  react: "React/Next.js",
  vue: "Vue/Nuxt",
  angular: "Angular",
  aws: "AWS",
  vercel: "Vercel",
  netlify: "Netlify",
  cloudflare: "Cloudflare Pages",
  other: "Other",
};

const LinkedWebsites = ({ entityId }: LinkedWebsitesProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<EntityWebsite | null>(null);
  const [deletingWebsite, setDeletingWebsite] = useState<EntityWebsite | null>(null);
  const { canWrite } = useUserRole();

  const createMutation = useCreateEntityWebsite();
  const updateMutation = useUpdateEntityWebsite();
  const deleteMutation = useDeleteEntityWebsite();

  // Fetch websites linked via junction table
  const { data: linkedWebsites = [] } = useQuery({
    queryKey: ["entity-website-links", entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await supabase
        .from("website_entity_links")
        .select(`
          id,
          website_id,
          is_primary,
          website:entity_websites(*)
        `)
        .eq("entity_id", entityId);
      if (error) throw error;
      return data as WebsiteEntityLink[];
    },
    enabled: !!entityId,
  });

  // Map linked websites for display
  const allWebsites = linkedWebsites
    .filter(link => link.website)
    .map(link => ({ 
      website: link.website!, 
      linkIsPrimary: link.is_primary 
    }));

  const handleSubmit = (data: EntityWebsiteFormData) => {
    const payload = {
      name: data.name,
      url: data.url,
      type: data.type,
      platform: data.platform || null,
      is_primary: data.is_primary,
      is_active: data.is_active,
      ssl_expiry_date: data.ssl_expiry_date || null,
      domain_expiry_date: data.domain_expiry_date || null,
      notes: data.notes || null,
    };

    if (editingWebsite) {
      updateMutation.mutate({ id: editingWebsite.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (website: EntityWebsite) => {
    setEditingWebsite(website);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingWebsite) {
      deleteMutation.mutate(deletingWebsite.id, {
        onSuccess: () => setDeletingWebsite(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingWebsite(null);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Websites & URLs</h3>
          <Badge variant="secondary" className="text-xs">{allWebsites.length}</Badge>
        </div>
        {canWrite && (
          <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="gap-1">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        )}
      </div>

      {allWebsites.length === 0 ? (
        <p className="text-sm text-muted-foreground">No websites linked</p>
      ) : (
        <div className="space-y-3">
          {allWebsites.map(({ website, linkIsPrimary }) => (
            <div key={website.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{website.name}</span>
                    {(website.is_primary || linkIsPrimary) && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                    <Link2 className="w-3 h-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[website.type] || website.type}
                    </Badge>
                    {!website.is_active && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                  <a 
                    href={website.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                  >
                    {website.url}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                  {website.platform && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Platform: {platformLabels[website.platform] || website.platform}
                    </p>
                  )}
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
                    <DropdownMenuItem onClick={() => handleEdit(website)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeletingWebsite(website)}
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
              {editingWebsite ? "Edit Website" : "Add Website"}
            </DialogTitle>
          </DialogHeader>
          <WebsiteForm
            website={editingWebsite}
            defaultEntityId={entityId}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingWebsite}
        onOpenChange={() => setDeletingWebsite(null)}
        onConfirm={handleDelete}
        title="Delete Website"
        description={`Are you sure you want to delete "${deletingWebsite?.name}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedWebsites;
