import { useState } from "react";
import { Plus, FileText, Download, Eye, Calendar, AlertCircle, CheckCircle2, Edit2, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useContracts, useEntities } from "@/hooks/usePortalData";
import { useCreateContract, useUpdateContract, useDeleteContract } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContractForm from "@/components/forms/ContractForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { format, differenceInDays } from "date-fns";
import type { Contract } from "@/hooks/usePortalData";
import type { ContractFormData } from "@/lib/formSchemas";

interface ContractsSectionProps {
  entityFilter?: string | null;
}

const ContractsSection = ({ entityFilter }: ContractsSectionProps) => {
  const { data: contracts, isLoading } = useContracts();
  const { data: entities } = useEntities();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();

  const handleSubmit = (data: ContractFormData & { file_path?: string; file_name?: string }) => {
    const cleanData = {
      ...data,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      entity_id: data.entity_id || null,
      file_path: data.file_path || null,
      file_name: data.file_name || null,
    };
    
    if (editingContract) {
      updateContract.mutate({ id: editingContract.id, ...cleanData }, { 
        onSuccess: () => { setIsFormOpen(false); setEditingContract(null); }
      });
    } else {
      createContract.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteContract.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContract(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const filteredContracts = entityFilter 
    ? (contracts ?? []).filter(c => c.entity_id === entityFilter)
    : (contracts ?? []);

  const isEmpty = filteredContracts.length === 0;
  const activeContracts = filteredContracts.filter(c => c.status === "active").length;
  const expiringContracts = filteredContracts.filter(c => c.status === "expiring-soon").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Contracts</h2>
          <p className="text-muted-foreground">
            {entityFilter 
              ? `Showing contracts for selected entity (${filteredContracts.length} of ${contracts?.length ?? 0})`
              : "Track and manage all your business and personal contracts."}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Contract
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeContracts}</p>
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
              <p className="text-2xl font-bold text-foreground">{expiringContracts}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {entityFilter ? "No contracts linked to this entity." : "No contracts added yet."}
          </p>
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Your First Contract
          </Button>
        </div>
      ) : (
        /* Contracts List */
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contract</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => {
                  const daysUntilExpiry = contract.end_date 
                    ? differenceInDays(new Date(contract.end_date), new Date())
                    : null;
                  const linkedEntity = entities?.find(e => e.id === contract.entity_id);

                  return (
                    <tr key={contract.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{contract.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {contract.parties?.join(" & ") || "—"}
                            </p>
                            {linkedEntity && (
                              <div className="flex items-center gap-1 mt-1">
                                <Building2 className="w-3 h-3 text-primary" />
                                <span className="text-xs text-primary">{linkedEntity.name}</span>
                              </div>
                            )}
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
                            <p className="text-foreground">
                              {contract.start_date 
                                ? format(new Date(contract.start_date), "MMM d, yyyy")
                                : "—"}
                            </p>
                            <p className="text-muted-foreground">
                              to {contract.end_date 
                                ? format(new Date(contract.end_date), "MMM d, yyyy")
                                : "Indefinite"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          contract.status === "active" && "bg-success/10 text-success",
                          contract.status === "expiring-soon" && "bg-warning/10 text-warning",
                          contract.status === "expired" && "bg-destructive/10 text-destructive"
                        )}>
                          {contract.status === "active" && "Active"}
                          {contract.status === "expiring-soon" && (daysUntilExpiry !== null ? `${daysUntilExpiry} days left` : "Expiring")}
                          {contract.status === "expired" && "Expired"}
                          {!["active", "expiring-soon", "expired"].includes(contract.status) && contract.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button 
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            onClick={() => handleEdit(contract)}
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button 
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                            onClick={() => setDeletingId(contract.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContract ? "Edit Contract" : "Add Contract"}</DialogTitle>
          </DialogHeader>
          <ContractForm
            contract={editingContract}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createContract.isPending || updateContract.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Contract"
        description="This will permanently delete this contract."
        isLoading={deleteContract.isPending}
      />
    </div>
  );
};

export default ContractsSection;