import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CompanyLogo from "@/components/shared/CompanyLogo";

interface EntityLink {
  id: string;
  entity_id: string;
  is_active: boolean;
  entity?: {
    id: string;
    name: string;
    website: string | null;
  };
}

interface ShareholderEntityAffiliationsManagerProps {
  shareholderId: string | null;
  currentEntityId: string;
  currentEntityName?: string;
}

const ShareholderEntityAffiliationsManager = ({
  shareholderId,
  currentEntityId,
  currentEntityName,
}: ShareholderEntityAffiliationsManagerProps) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch all entities for the dropdown
  const { data: entities = [] } = useQuery({
    queryKey: ["entities-for-shareholder-affiliation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("id, name, website")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing entity links for this shareholder
  const { data: existingLinks = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ["shareholder-entity-links", shareholderId],
    queryFn: async () => {
      if (!shareholderId) return [];
      const { data, error } = await supabase
        .from("shareholder_entity_links")
        .select(`
          id,
          entity_id,
          is_active,
          entity:entities(id, name, website)
        `)
        .eq("shareholder_id", shareholderId);
      if (error) throw error;
      return data as EntityLink[];
    },
    enabled: !!shareholderId,
  });

  // Add new entity link
  const addLinkMutation = useMutation({
    mutationFn: async (entityId: string) => {
      if (!shareholderId) throw new Error("Shareholder ID is required");
      
      const { data, error } = await supabase
        .from("shareholder_entity_links")
        .insert({
          shareholder_id: shareholderId,
          entity_id: entityId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholder-entity-links", shareholderId] });
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
      setSelectedEntityId("");
      toast.success("Entity affiliation added");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("This shareholder is already linked to this entity");
      } else {
        toast.error("Failed to add affiliation");
      }
    },
  });

  // Remove entity link
  const removeLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from("shareholder_entity_links")
        .delete()
        .eq("id", linkId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholder-entity-links", shareholderId] });
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
      toast.success("Entity affiliation removed");
    },
    onError: () => {
      toast.error("Failed to remove affiliation");
    },
  });

  // Filter out already linked entities from the dropdown
  const linkedEntityIds = existingLinks.map(link => link.entity_id);
  const availableEntities = entities.filter(
    entity => !linkedEntityIds.includes(entity.id)
  );

  const handleAddLink = () => {
    if (!selectedEntityId) {
      toast.error("Please select an entity");
      return;
    }
    addLinkMutation.mutate(selectedEntityId);
  };

  // If no shareholder ID yet (new shareholder), show a message
  if (!shareholderId) {
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Entity Affiliations
        </Label>
        <div className="p-4 bg-muted/50 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">
            Save this shareholder first to add affiliations with other entities
          </p>
          {currentEntityName && (
            <p className="text-sm mt-2">
              Primary entity: <span className="font-medium">{currentEntityName}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Entity Affiliations
      </Label>
      
      {/* Existing Links */}
      <div className="space-y-2">
        {isLoadingLinks ? (
          <div className="p-3 bg-muted/50 rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        ) : existingLinks.length === 0 ? (
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">No entity affiliations yet</p>
          </div>
        ) : (
          existingLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CompanyLogo
                  domain={link.entity?.website}
                  name={link.entity?.name || ""}
                  size="sm"
                  className="w-8 h-8 rounded-md flex-shrink-0"
                />
                <div className="min-w-0">
                  <Link
                    to={`/entity/${link.entity_id}`}
                    className="font-medium text-sm hover:underline flex items-center gap-1"
                  >
                    {link.entity?.name}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeLinkMutation.mutate(link.id)}
                disabled={removeLinkMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add New Link */}
      {availableEntities.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Add Entity</Label>
            <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity..." />
              </SelectTrigger>
              <SelectContent>
                {availableEntities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}</SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            size="icon"
            onClick={handleAddLink}
            disabled={!selectedEntityId || addLinkMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShareholderEntityAffiliationsManager;
