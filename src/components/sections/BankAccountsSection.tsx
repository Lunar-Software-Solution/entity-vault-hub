import { useState } from "react";
import { Plus, MoreVertical, Edit2, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBankAccounts, useEntities } from "@/hooks/usePortalData";
import { useCreateBankAccount, useUpdateBankAccount, useDeleteBankAccount } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BankAccountForm from "@/components/forms/BankAccountForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import CompanyLogo from "@/components/shared/CompanyLogo";
import type { BankAccount } from "@/hooks/usePortalData";
import type { BankAccountFormData } from "@/lib/formSchemas";

interface BankAccountsSectionProps {
  entityFilter?: string | null;
}

const BankAccountsSection = ({ entityFilter }: BankAccountsSectionProps) => {
  const { data: bankAccounts, isLoading } = useBankAccounts();
  const { data: entities } = useEntities();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const createAccount = useCreateBankAccount();
  const updateAccount = useUpdateBankAccount();
  const deleteAccount = useDeleteBankAccount();

  const handleSubmit = (data: BankAccountFormData) => {
    const cleanData = {
      ...data,
      routing_number: data.routing_number || null,
      bank_website: data.bank_website || null,
      entity_id: data.entity_id || null,
      iban: data.iban || null,
      swift_bic: data.swift_bic || null,
      account_holder_name: data.account_holder_name || null,
      bank_address: data.bank_address || null,
    };
    
    if (editingAccount) {
      updateAccount.mutate({ id: editingAccount.id, ...cleanData }, { 
        onSuccess: () => { setIsFormOpen(false); setEditingAccount(null); }
      });
    } else {
      createAccount.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteAccount.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const filteredAccounts = entityFilter 
    ? (bankAccounts ?? []).filter(acc => acc.entity_id === entityFilter)
    : (bankAccounts ?? []);

  const isEmpty = filteredAccounts.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Bank Accounts</h2>
          <p className="text-muted-foreground">
            {entityFilter 
              ? `Showing accounts for selected entity (${filteredAccounts.length} of ${bankAccounts?.length ?? 0})`
              : "Manage your connected bank accounts."}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      {isEmpty ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {entityFilter ? "No bank accounts linked to this entity." : "No bank accounts added yet."}
          </p>
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Your First Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAccounts.map((account) => {
            const linkedEntity = entities?.find(e => e.id === account.entity_id);
            return (
              <div key={account.id} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CompanyLogo
                      domain={(account as any).bank_website}
                      name={account.bank}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">{account.bank}</p>
                      {linkedEntity && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3 text-primary" />
                          <span className="text-xs text-primary">{linkedEntity.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(account)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingId(account.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Account Holder */}
                {(account as any).account_holder_name && (
                  <div className="mt-4 px-3 py-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-0.5">Account Holder</p>
                    <p className="text-sm font-medium text-foreground">{(account as any).account_holder_name}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                    <p className="font-mono text-foreground">{account.account_number}</p>
                  </div>
                  {(account as any).iban && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">IBAN</p>
                      <p className="font-mono text-foreground text-sm">{(account as any).iban}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Routing Number</p>
                    <p className="font-mono text-foreground">{account.routing_number || "—"}</p>
                  </div>
                  {(account as any).swift_bic && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">SWIFT/BIC</p>
                      <p className="font-mono text-foreground">{(account as any).swift_bic}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{account.type}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Currency</p>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{account.currency}</span>
                  </div>
                </div>

                {/* Bank Address */}
                {(account as any).bank_address && (
                  <div className="mt-4 px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-0.5">Bank Address</p>
                    <p className="text-sm text-foreground">{(account as any).bank_address}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
          </DialogHeader>
          <BankAccountForm
            account={editingAccount}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createAccount.isPending || updateAccount.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Bank Account"
        description="This will permanently delete this bank account."
        isLoading={deleteAccount.isPending}
      />
    </div>
  );
};

export default BankAccountsSection;