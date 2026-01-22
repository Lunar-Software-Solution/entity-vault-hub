import type { BankAccount } from "@/hooks/usePortalData";
import { Wallet } from "lucide-react";

interface LinkedBankAccountsProps {
  accounts: BankAccount[];
}

const LinkedBankAccounts = ({ accounts }: LinkedBankAccountsProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Bank Accounts</h3>
          <p className="text-sm text-muted-foreground">{accounts.length} linked</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No bank accounts linked to this entity.
        </p>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className="bg-muted/30 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{account.name}</p>
                  <p className="text-sm text-muted-foreground">{account.bank}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {account.type}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="font-mono text-muted-foreground">
                  ••••{account.account_number.slice(-4)}
                </span>
                <span className="text-muted-foreground">{account.currency}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedBankAccounts;
