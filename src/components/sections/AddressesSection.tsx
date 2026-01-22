import { Plus, MapPin, Home, Building2, Package, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const addresses = [
  {
    id: 1,
    label: "Home",
    type: "home",
    street: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    isPrimary: true,
    icon: Home
  },
  {
    id: 2,
    label: "Office",
    type: "office",
    street: "456 Business Avenue, Suite 200",
    city: "New York",
    state: "NY",
    zip: "10018",
    country: "United States",
    isPrimary: false,
    icon: Building2
  },
  {
    id: 3,
    label: "Shipping",
    type: "shipping",
    street: "789 Warehouse Blvd",
    city: "Newark",
    state: "NJ",
    zip: "07102",
    country: "United States",
    isPrimary: false,
    icon: Package
  }
];

const AddressesSection = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Addresses</h2>
          <p className="text-muted-foreground">Manage your registered addresses for different purposes.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address.id} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <address.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{address.label}</h3>
                    {address.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{address.type} Address</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground">{address.street}</p>
                <p className="text-muted-foreground">
                  {address.city}, {address.state} {address.zip}
                </p>
                <p className="text-muted-foreground">{address.country}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Copy Address</Button>
              <Button variant="outline" size="sm" className="flex-1">View on Map</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesSection;
