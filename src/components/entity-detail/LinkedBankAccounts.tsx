import { useState } from "react";
import type { BankAccount } from "@/hooks/usePortalData";
import { Wallet, ExternalLink, Eye, EyeOff, Copy, Check } from "lucide-react";
import CompanyLogo from "@/components/shared/CompanyLogo";
import CopyButton from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LinkedBankAccountsProps {
  accounts: BankAccount[];
}

const LinkedBankAccounts = ({ accounts }: LinkedBankAccountsProps) => {
  const [revealedAccounts, setRevealedAccounts] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const openBankWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleReveal = (accountId: string) => {
    setRevealedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const maskAccountNumber = (number: string): string => {
    if (number.length <= 4) return number;
    return `****${number.slice(-4)}`;
  };

  const maskIban = (iban: string): string => {
    const clean = iban.replace(/\s/g, '');
    if (clean.length <= 4) return iban;
    return `****${clean.slice(-4)}`;
  };

  const formatAllAccounts = (): string => {
    return accounts.map(account => {
      const lines = [
        `📌 ${account.name}`,
        `Bank: ${account.bank}`,
        `Type: ${account.type} • Currency: ${account.currency}`,
      ];
      
      if ((account as any).account_holder_name) {
        lines.push(`Account Holder: ${(account as any).account_holder_name}`);
      }
      lines.push(`Account Number: ${account.account_number}`);
      
      if ((account as any).iban) {
        lines.push(`IBAN: ${(account as any).iban}`);
      }
      if (account.routing_number) {
        lines.push(`Routing Number: ${account.routing_number}`);
      }
      if ((account as any).swift_bic) {
        lines.push(`SWIFT/BIC: ${(account as any).swift_bic}`);
      }
      if ((account as any).bank_address) {
        lines.push(`Bank Address: ${(account as any).bank_address}`);
      }
      
      return lines.join('\n');
    }).join('\n\n---\n\n');
  };

  const copyAllAccounts = async () => {
    if (accounts.length === 0) return;
    
    const text = formatAllAccounts();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Copied ${accounts.length} bank account(s) to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Bank Accounts</h3>
          <p className="text-sm text-muted-foreground">{accounts.length} linked</p>
        </div>
        {accounts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllAccounts}
            className="gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy All
          </Button>
        )}
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No bank accounts linked to this entity.
        </p>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            const bankWebsite = (account as any).bank_website;
            const isRevealed = revealedAccounts.has(account.id);
            return (
              <div 
                key={account.id} 
                className="bg-muted/30 rounded-lg p-4 border border-border/50"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <CompanyLogo
                    domain={bankWebsite}
                    name={account.bank}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{account.name}</p>
                          {(account as any).is_primary && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">Primary</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{account.bank}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {account.type}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {account.currency}
                        </span>
                        {bankWebsite && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 text-foreground"
                            onClick={() => openBankWebsite(bankWebsite)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Holder */}
                {(account as any).account_holder_name && (
                  <div className="mb-3 px-3 py-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-0.5">Account Holder</p>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-foreground">{(account as any).account_holder_name}</p>
                      <CopyButton value={(account as any).account_holder_name} label="Account holder" />
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Account Number */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Account Number</p>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm text-foreground">
                        {isRevealed ? account.account_number : maskAccountNumber(account.account_number)}
                      </span>
                      <CopyButton value={account.account_number} label="Account number" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleReveal(account.id);
                        }}
                        className="p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title={isRevealed ? "Hide details" : "Show details"}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* IBAN */}
                  {(account as any).iban && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">IBAN</p>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-foreground">
                          {isRevealed ? (account as any).iban : maskIban((account as any).iban)}
                        </span>
                        <CopyButton value={(account as any).iban.replace(/\s/g, '')} label="IBAN" />
                      </div>
                    </div>
                  )}

                  {/* Routing Number */}
                  {account.routing_number && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Routing Number</p>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-foreground">{account.routing_number}</span>
                        <CopyButton value={account.routing_number} label="Routing number" />
                      </div>
                    </div>
                  )}

                  {/* SWIFT/BIC */}
                  {(account as any).swift_bic && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">SWIFT/BIC</p>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-foreground">{(account as any).swift_bic}</span>
                        <CopyButton value={(account as any).swift_bic} label="SWIFT/BIC" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Address */}
                {(account as any).bank_address && (
                  <div className="mt-3 px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-0.5">Bank Address</p>
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-foreground flex-1">{(account as any).bank_address}</p>
                      <CopyButton value={(account as any).bank_address} label="Bank address" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LinkedBankAccounts;