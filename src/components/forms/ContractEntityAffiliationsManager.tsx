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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import CompanyLogo from "@/components/shared/CompanyLogo";

interface ContractEntityLink {
  id: string;
  entity_id: string;
  is_primary: boolean;
  role: string | null;
  notes: string | null;
  entity?: {
    id: string;
    name: string;
    website: string | null;
  };
}

interface ContractEntityAffiliationsManagerProps {
  contractId: string | null;
}

const ROLE_OPTIONS = [
  { value: "party", label: "Party" },
  { value: "beneficiary", label: "Beneficiary" },
  { value: "guarantor", label: "Guarantor" },
  { value: "signatory", label: "Signatory" },
  { value: "witness", label: "Witness" },
];

const ContractEntityAffiliationsManager = ({
  contractId,
}: ContractEntityAffiliationsManagerProps) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("party");
  const [isPrimary, setIsPrimary] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all entities for the dropdown
  const { data: entities = [] } = useQuery({
    queryKey: ["entities-for-contract-affiliation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("id, name, website")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch existing entity links for this contract
  const { data: existingLinks = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ["contract-entity-links", contractId],
    queryFn: async () => {
      if (!contractId) return [];
      const { data, error } = await supabase
        .from("contract_entity_links")
        .select(
          `
          id,
          entity_id,
          is_primary,
          role,
          notes,
          entity:entities(id, name, website)
        `
        )
        .eq("contract_id", contractId);
      if (error) throw error;
      return data as ContractEntityLink[];
    },
    enabled: !!contractId,
  });

  // Add new entity link
  const addLinkMutation = useMutation({
    mutationFn: async ({ 
      entityId, 
      isPrimary,
      role,
    }: { 
      entityId: string; 
      isPrimary: boolean;
      role: string;
    }) => {
      if (!contractId) throw new Error("Contract ID is required");
      
      const { data, error } = await supabase
        .from("contract_entity_links")
        .insert({
          contract_id: contractId,
          entity_id: entityId,
          is_primary: isPrimary,
          role: role,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-entity-links", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setSelectedEntityId("");
      setSelectedRole("party");
      setIsPrimary(false);
      toast.success("Entity linked to contract");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("This contract is already linked to this entity");
      } else {
        toast.error("Failed to link entity");
      }
    },
  });

  // Remove entity link
  const removeLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from("contract_entity_links")
        .delete()
        .eq("id", linkId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-entity-links", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Entity link removed");
    },
    onError: () => {
      toast.error("Failed to remove entity link");
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
    addLinkMutation.mutate({ 
      entityId: selectedEntityId, 
      isPrimary,
      role: selectedRole,
    });
  };

  // If no contract ID yet (new contract), show a message
  if (!contractId) {
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Linked Entities
        </Label>
        <div className="p-4 bg-muted/50 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">
            Save this contract first to link it to entities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Linked Entities
      </Label>
      
      {/* Existing Links */}
      <div className="space-y-2">
        {isLoadingLinks ? (
          <div className="p-3 bg-muted/50 rounded-lg animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        ) : existingLinks.length === 0 ? (
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">No entities linked yet</p>
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
                  <div className="flex items-center gap-2 mt-1">
                    {link.role && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {link.role}
                      </Badge>
                    )}
                    {link.is_primary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
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
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[150px] space-y-1">
            <Label className="text-xs text-muted-foreground">Entity</Label>
            <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity..." />
              </SelectTrigger>
              <SelectContent>
                {availableEntities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))
                }
              </SelectContent>
            </Select>
          </div>
          <div className="w-[120px] space-y-1">
            <Label className="text-xs text-muted-foreground">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <Switch
              id="is-primary-contract"
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
            />
            <Label htmlFor="is-primary-contract" className="text-xs text-muted-foreground cursor-pointer">
              Primary
            </Label>
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

export default ContractEntityAffiliationsManager;
