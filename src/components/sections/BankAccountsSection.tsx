import { Plus, MoreVertical, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const bankAccounts = [
  {
    id: 1,
    name: "Chase Business Checking",
    bank: "JPMorgan Chase",
    accountNumber: "****4532",
    routingNumber: "021000021",
    balance: 78450.00,
    currency: "USD",
    type: "Checking",
    lastTransaction: "+$2,340.00",
    trend: "up"
  },
  {
    id: 2,
    name: "Wells Fargo Savings",
    bank: "Wells Fargo",
    accountNumber: "****8821",
    routingNumber: "121042882",
    balance: 35680.00,
    currency: "USD",
    type: "Savings",
    lastTransaction: "+$150.00",
    trend: "up"
  },
  {
    id: 3,
    name: "Bank of America Payroll",
    bank: "Bank of America",
    accountNumber: "****1199",
    routingNumber: "026009593",
    balance: 10450.00,
    currency: "USD",
    type: "Checking",
    lastTransaction: "-$5,200.00",
    trend: "down"
  }
];

const BankAccountsSection = () => {
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
                <p className="font-mono text-foreground">{account.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Routing Number</p>
                <p className="font-mono text-foreground">{account.routingNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{account.type}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Transaction</p>
                <div className="flex items-center gap-1">
                  {account.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                  <span className={account.trend === "up" ? "text-success" : "text-destructive"}>
                    {account.lastTransaction}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
    </div>
  );
};

export default BankAccountsSection;
