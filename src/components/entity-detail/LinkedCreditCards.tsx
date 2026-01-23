import type { CreditCard } from "@/hooks/usePortalData";
import { CreditCard as CreditCardIcon } from "lucide-react";
import CompanyLogo from "@/components/shared/CompanyLogo";

interface LinkedCreditCardsProps {
  cards: CreditCard[];
}

const LinkedCreditCards = ({ cards }: LinkedCreditCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CreditCardIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Credit Cards</h3>
          <p className="text-sm text-muted-foreground">{cards.length} linked</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No credit cards linked to this entity.
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className={`rounded-lg p-4 bg-gradient-to-br ${card.card_color} text-white`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="font-medium">{card.name}</p>
                <CompanyLogo 
                  domain={(card as any).issuer_website} 
                  name={card.name} 
                  size="sm"
                  className="bg-white/20 rounded-lg"
                />
              </div>
              <p className="font-mono text-sm opacity-80 mb-2">
                •••• •••• •••• {card.card_number.slice(-4)}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-80">
                  {card.cardholder_name || "Cardholder"}
                </span>
                <span className="font-medium">
                  {formatCurrency(Number(card.credit_limit))}
                </span>
              </div>
              {card.expiry_date && (
                <p className="text-xs opacity-60 mt-1">Exp: {card.expiry_date}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedCreditCards;
