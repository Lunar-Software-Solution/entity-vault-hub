import { Building2, Calendar, MapPin, Mail, Phone, Globe, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const EntitySection = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Entity Details</h2>
          <p className="text-muted-foreground">Manage your business or personal entity information.</p>
        </div>
        <Button className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Entity
        </Button>
      </div>

      <div className="glass-card rounded-xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground">Acme Corporation</h3>
            <p className="text-muted-foreground">Limited Liability Company (LLC)</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">Active</span>
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">Verified</span>
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
                  <p className="text-foreground font-medium">January 15, 2020</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Jurisdiction</p>
                  <p className="text-foreground font-medium">Delaware, USA</p>
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
                  <p className="text-foreground font-medium">contact@acme.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="text-foreground font-medium">www.acme.com</p>
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
              <p className="font-mono text-foreground">XX-XXXXXXX</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Registration Number</p>
              <p className="font-mono text-foreground">DE-2020-XXXXX</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">DUNS Number</p>
              <p className="font-mono text-foreground">XX-XXX-XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntitySection;
