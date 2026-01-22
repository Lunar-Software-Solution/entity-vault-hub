import type { Contract } from "@/hooks/usePortalData";
import { FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface LinkedContractsProps {
  contracts: Contract[];
}

const LinkedContracts = ({ contracts }: LinkedContractsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "expiring-soon":
        return "bg-warning/10 text-warning border-warning/20";
      case "expired":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Contracts</h3>
          <p className="text-sm text-muted-foreground">{contracts.length} linked</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No contracts linked to this entity.
        </p>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <div 
              key={contract.id} 
              className="bg-muted/30 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-foreground">{contract.title}</p>
                  <p className="text-xs text-muted-foreground">{contract.type}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(contract.status)}`}
                >
                  {contract.status === "expiring-soon" && (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {contract.status}
                </Badge>
              </div>
              
              {contract.parties && contract.parties.length > 0 && (
                <p className="text-sm text-muted-foreground mb-2">
                  Parties: {contract.parties.join(", ")}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {contract.start_date && (
                  <span>Start: {format(new Date(contract.start_date), "MMM d, yyyy")}</span>
                )}
                {contract.end_date && (
                  <span>End: {format(new Date(contract.end_date), "MMM d, yyyy")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedContracts;
