import type { BankAccount } from "@/hooks/usePortalData";
import { Wallet, ExternalLink } from "lucide-react";
import CompanyLogo from "@/components/shared/CompanyLogo";
import CopyButton from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";

interface LinkedBankAccountsProps {
  accounts: BankAccount[];
}

const LinkedBankAccounts = ({ accounts }: LinkedBankAccountsProps) => {
  const openBankWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
          {accounts.map((account) => {
            const bankWebsite = (account as any).bank_website;
            return (
              <div 
                key={account.id} 
                className="bg-muted/30 rounded-lg p-4 border border-border/50"
              >
                <div className="flex items-start gap-3">
                  <CompanyLogo
                    domain={bankWebsite}
                    name={account.bank}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.bank}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {account.type}
                        </span>
                        {bankWebsite && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => openBankWebsite(bankWebsite)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {(account as any).account_holder_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(account as any).account_holder_name}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-muted-foreground">
                          ••••{account.account_number.slice(-4)}
                        </span>
                        <CopyButton value={account.account_number} label="Account number" />
                      </div>
                      {(account as any).iban && (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-muted-foreground text-xs">
                            IBAN: {(account as any).iban}
                          </span>
                          <CopyButton value={(account as any).iban.replace(/\s/g, '')} label="IBAN" />
                        </div>
                      )}
                      {(account as any).swift_bic && (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-muted-foreground text-xs">
                            SWIFT: {(account as any).swift_bic}
                          </span>
                          <CopyButton value={(account as any).swift_bic} label="SWIFT/BIC" />
                        </div>
                      )}
                      <span className="text-muted-foreground">{account.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LinkedBankAccounts;