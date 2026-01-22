import { Plus, MoreVertical, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBankAccounts } from "@/hooks/usePortalData";
import { Skeleton } from "@/components/ui/skeleton";

const BankAccountsSection = () => {
  const { data: bankAccounts, isLoading } = useBankAccounts();

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

  const isEmpty = !bankAccounts || bankAccounts.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Bank Accounts</h2>
          <p className="text-muted-foreground">Manage your connected bank accounts and view balances.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      {isEmpty ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">No bank accounts added yet.</p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bankAccounts.map((account) => (
            <div key={account.id} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{account.bank.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">{account.bank}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                  <p className="font-mono text-foreground">{account.account_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Routing Number</p>
                  <p className="font-mono text-foreground">{account.routing_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{account.type}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Transaction</p>
                  {account.last_transaction_amount ? (
                    <div className="flex items-center gap-1">
                      {account.last_transaction_type === "credit" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                      <span className={account.last_transaction_type === "credit" ? "text-success" : "text-destructive"}>
                        {account.last_transaction_type === "credit" ? "+" : "-"}${Math.abs(account.last_transaction_amount).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Transactions</Button>
                  <Button variant="outline" size="sm">Download Statement</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankAccountsSection;
