import type { Address } from "@/hooks/usePortalData";
import { MapPin, Star, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LinkedAddressesProps {
  addresses: Address[];
  entityId?: string;
}

interface AddressEntityLink {
  id: string;
  address_id: string;
  is_primary: boolean;
  role: string | null;
  address?: Address;
}

const LinkedAddresses = ({ addresses, entityId }: LinkedAddressesProps) => {
  // Fetch addresses linked via junction table
  const { data: linkedAddresses = [] } = useQuery({
    queryKey: ["entity-address-links", entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await supabase
        .from("address_entity_links")
        .select(`
          id,
          address_id,
          is_primary,
          role,
          address:addresses(*)
        `)
        .eq("entity_id", entityId);
      if (error) throw error;
      return data as AddressEntityLink[];
    },
    enabled: !!entityId,
  });

  // Combine direct addresses with linked addresses, avoiding duplicates
  const directAddressIds = new Set(addresses.map(a => a.id));
  const additionalLinkedAddresses = linkedAddresses.filter(
    link => link.address && !directAddressIds.has(link.address_id)
  );

  const allAddresses = [
    ...addresses.map(addr => ({ address: addr, isLinked: false, role: null, linkIsPrimary: false })),
    ...additionalLinkedAddresses.map(link => ({ 
      address: link.address!, 
      isLinked: true, 
      role: link.role,
      linkIsPrimary: link.is_primary 
    })),
  ];

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Addresses</h3>
          <p className="text-sm text-muted-foreground">{allAddresses.length} linked</p>
        </div>
      </div>

      {allAddresses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No addresses linked to this entity.
        </p>
      ) : (
        <div className="space-y-3">
          {allAddresses.map(({ address, isLinked, role, linkIsPrimary }) => (
            <div 
              key={address.id} 
              className="bg-muted/30 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{address.label}</span>
                  {(address.is_primary || linkIsPrimary) && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {isLinked && (
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {role && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {role}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {address.type}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {address.street}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.city}{address.state ? `, ${address.state}` : ""} {address.zip}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.country}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedAddresses;
