import { Plus, FileText, Download, Eye, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const contracts = [
  {
    id: 1,
    title: "Office Lease Agreement",
    type: "Real Estate",
    parties: ["Acme Corp", "Manhattan Properties LLC"],
    startDate: "Jan 1, 2023",
    endDate: "Dec 31, 2025",
    status: "active",
    value: "$48,000/year",
    daysUntilExpiry: 320
  },
  {
    id: 2,
    title: "Software License Agreement",
    type: "Technology",
    parties: ["Acme Corp", "Microsoft Corporation"],
    startDate: "Mar 15, 2023",
    endDate: "Mar 14, 2024",
    status: "expiring-soon",
    value: "$12,000/year",
    daysUntilExpiry: 45
  },
  {
    id: 3,
    title: "Employment Contract - Senior Developer",
    type: "Employment",
    parties: ["Acme Corp", "Jane Smith"],
    startDate: "Jun 1, 2022",
    endDate: "Indefinite",
    status: "active",
    value: "$120,000/year",
    daysUntilExpiry: null
  },
  {
    id: 4,
    title: "Insurance Policy - Business",
    type: "Insurance",
    parties: ["Acme Corp", "State Farm"],
    startDate: "Jan 1, 2024",
    endDate: "Dec 31, 2024",
    status: "active",
    value: "$8,500/year",
    daysUntilExpiry: 340
  },
  {
    id: 5,
    title: "Vendor Agreement - Cloud Services",
    type: "Service",
    parties: ["Acme Corp", "AWS"],
    startDate: "Sep 1, 2023",
    endDate: "Aug 31, 2024",
    status: "expiring-soon",
    value: "$24,000/year",
    daysUntilExpiry: 60
  }
];

const ContractsSection = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Contracts</h2>
          <p className="text-muted-foreground">Track and manage all your business and personal contracts.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contract
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Active Contracts</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">2</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">$212,500</p>
              <p className="text-sm text-muted-foreground">Total Annual Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contract</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Duration</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Value</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{contract.title}</p>
                        <p className="text-xs text-muted-foreground">{contract.parties.join(" & ")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                      {contract.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="text-foreground">{contract.startDate}</p>
                        <p className="text-muted-foreground">to {contract.endDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-foreground">{contract.value}</p>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      contract.status === "active" && "bg-success/10 text-success",
                      contract.status === "expiring-soon" && "bg-warning/10 text-warning",
                      contract.status === "expired" && "bg-destructive/10 text-destructive"
                    )}>
                      {contract.status === "active" && "Active"}
                      {contract.status === "expiring-soon" && `${contract.daysUntilExpiry} days left`}
                      {contract.status === "expired" && "Expired"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractsSection;
