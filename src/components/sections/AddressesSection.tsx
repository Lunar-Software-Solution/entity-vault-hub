import { useState } from "react";
import { Plus, MapPin, Home, Building2, Package, Pencil, Trash2, Copy, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddresses, useEntities } from "@/hooks/usePortalData";
import { useCreateAddress, useUpdateAddress, useDeleteAddress } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddressForm from "@/components/forms/AddressForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import type { Address } from "@/hooks/usePortalData";
import type { AddressFormData } from "@/lib/formSchemas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const getAddressIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "home":
      return Home;
    case "office":
      return Building2;
    case "shipping":
      return Package;
    default:
      return MapPin;
  }
};

interface AddressesSectionProps {
  entityFilter?: string | null;
}

const AddressesSection = ({ entityFilter }: AddressesSectionProps) => {
  const { data: addresses, isLoading } = useAddresses();
  const { data: entities } = useEntities();
  const { canWrite } = useUserRole();

  // Fetch address-entity links for filtering and display
  const { data: addressEntityLinks = [] } = useQuery({
    queryKey: ["address-entity-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("address_entity_links")
        .select("address_id, entity_id");
      if (error) throw error;
      return data as { address_id: string; entity_id: string }[];
    },
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const handleSubmit = (data: AddressFormData) => {
    const cleanData = {
      ...data,
      state: data.state || null,
      zip: data.zip || null,
    };
    
    if (editingAddress) {
      updateAddress.mutate({ id: editingAddress.id, ...cleanData }, { 
        onSuccess: () => { setIsFormOpen(false); setEditingAddress(null); }
      });
    } else {
      createAddress.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteAddress.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleCopyAddress = (address: Address) => {
    const fullAddress = [
      address.street,
      `${address.city}${address.state ? `, ${address.state}` : ""} ${address.zip || ""}`.trim(),
      address.country
    ].filter(Boolean).join("\n");
    
    navigator.clipboard.writeText(fullAddress).then(() => {
      toast.success("Address copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy address");
    });
  };

  const getMapUrl = (address: Address) => {
    const addressParts = [
      address.street.replace(/#/g, "Suite "),
      address.city,
      address.state,
      address.zip,
      address.country
    ].filter(Boolean).join(", ");
    
    // Use + for spaces for Google Maps compatibility
    const query = addressParts.replace(/\s+/g, "+");
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Build a map of address IDs to their linked entity IDs
  const addressToEntitiesMap = new Map<string, string[]>();
  addressEntityLinks.forEach(link => {
    const existing = addressToEntitiesMap.get(link.address_id) || [];
    addressToEntitiesMap.set(link.address_id, [...existing, link.entity_id]);
  });

  // Filter addresses: if entityFilter is set, only show addresses linked to that entity via junction table
  const filteredAddresses = entityFilter 
    ? (addresses ?? []).filter(addr => {
        const linkedEntityIds = addressToEntitiesMap.get(addr.id) || [];
        return linkedEntityIds.includes(entityFilter);
      })
    : (addresses ?? []);

  const isEmpty = filteredAddresses.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Addresses</h2>
          <p className="text-muted-foreground">
            {entityFilter 
              ? `Showing addresses for selected entity (${filteredAddresses.length} of ${addresses?.length ?? 0})`
              : "Manage your registered addresses for different purposes."}
          </p>
        </div>
        {canWrite && (
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        )}
      </div>

      {isEmpty ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {entityFilter ? "No addresses linked to this entity." : "No addresses added yet."}
          </p>
          {canWrite && (
            <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Address
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAddresses.map((address) => {
            const IconComponent = getAddressIcon(address.type);
            // Get linked entities from junction table
            const linkedEntityIds = addressToEntitiesMap.get(address.id) || [];
            const linkedEntities = entities?.filter(e => linkedEntityIds.includes(e.id)) || [];
            
            return (
              <div key={address.id} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{address.label}</h3>
                        {address.is_primary && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{address.type} Address</p>
                      {linkedEntities.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Link2 className="w-3 h-3 text-primary" />
                          {linkedEntities.slice(0, 2).map((entity, idx) => (
                            <span key={entity.id} className="text-xs text-primary">
                              {entity.name}{idx < Math.min(linkedEntities.length, 2) - 1 ? ", " : ""}
                            </span>
                          ))}
                          {linkedEntities.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{linkedEntities.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex gap-1">
                      <button 
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        onClick={() => handleEdit(address)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button 
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        onClick={() => setDeletingId(address.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground">{address.street}</p>
                    <p className="text-muted-foreground">
                      {address.city}{address.state ? `, ${address.state}` : ""} {address.zip || ""}
                    </p>
                    <p className="text-muted-foreground">{address.country}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2 text-foreground border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                    onClick={() => handleCopyAddress(address)}
                  >
                    <Copy className="w-3 h-3" />
                    Copy Address
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2 text-foreground border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                    onClick={() => {
                      navigator.clipboard.writeText(getMapUrl(address)).then(() => {
                        toast.success("Map link copied! Paste in a new tab to open.");
                      });
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Copy Map Link
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add Address"}</DialogTitle>
          </DialogHeader>
          <AddressForm
            address={editingAddress}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createAddress.isPending || updateAddress.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Address"
        description="This will permanently delete this address."
        isLoading={deleteAddress.isPending}
      />
    </div>
  );
};

export default AddressesSection;