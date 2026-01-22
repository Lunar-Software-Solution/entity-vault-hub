import type { Address } from "@/hooks/usePortalData";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LinkedAddressesProps {
  addresses: Address[];
}

const LinkedAddresses = ({ addresses }: LinkedAddressesProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Addresses</h3>
          <p className="text-sm text-muted-foreground">{addresses.length} linked</p>
        </div>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No addresses linked to this entity.
        </p>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className="bg-muted/30 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{address.label}</span>
                  {address.is_primary && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {address.type}
                </Badge>
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
