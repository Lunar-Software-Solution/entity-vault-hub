import { Plus, CreditCard, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const creditCards = [
  {
    id: 1,
    name: "American Express Platinum",
    cardNumber: "**** **** **** 1234",
    expiryDate: "12/26",
    creditLimit: 30000,
    currentBalance: 4520.50,
    availableCredit: 25479.50,
    minimumPayment: 150,
    dueDate: "Feb 15, 2024",
    color: "from-zinc-600 to-zinc-900"
  },
  {
    id: 2,
    name: "Chase Sapphire Reserve",
    cardNumber: "**** **** **** 5678",
    expiryDate: "08/25",
    creditLimit: 15000,
    currentBalance: 2180.00,
    availableCredit: 12820.00,
    minimumPayment: 75,
    dueDate: "Feb 20, 2024",
    color: "from-blue-600 to-blue-900"
  }
];

const CreditCardsSection = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Credit Cards</h2>
          <p className="text-muted-foreground">View and manage your credit cards and payments.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Card
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {creditCards.map((card) => (
          <div key={card.id} className="glass-card rounded-xl overflow-hidden">
            {/* Card Visual */}
            <div className={`p-6 bg-gradient-to-br ${card.color} text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <CreditCard className="w-10 h-10" />
                  <button className="p-1 hover:bg-white/20 rounded transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <p className="font-mono text-lg tracking-wider mb-4">{card.cardNumber}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Card Holder</p>
                    <p className="font-medium">JOHN DOE</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Expires</p>
                    <p className="font-medium">{card.expiryDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{card.name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credit Limit</span>
                  <span className="font-medium text-foreground">${card.creditLimit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Balance</span>
                  <span className="font-medium text-warning">${card.currentBalance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available Credit</span>
                  <span className="font-medium text-success">${card.availableCredit.toLocaleString()}</span>
                </div>
                
                {/* Credit Usage Bar */}
                <div className="pt-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(card.currentBalance / card.creditLimit) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {((card.currentBalance / card.creditLimit) * 100).toFixed(1)}% used
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Min. Payment Due</p>
                  <p className="font-semibold text-foreground">${card.minimumPayment} by {card.dueDate}</p>
                </div>
                <Button size="sm">Pay Now</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditCardsSection;
