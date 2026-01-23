import { useState } from "react";
import type { CreditCard } from "@/hooks/usePortalData";
import { CreditCard as CreditCardIcon, Eye, EyeOff, ExternalLink } from "lucide-react";
import CompanyLogo from "@/components/shared/CompanyLogo";
import CopyButton from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";

interface LinkedCreditCardsProps {
  cards: CreditCard[];
}

const LinkedCreditCards = ({ cards }: LinkedCreditCardsProps) => {
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleReveal = (cardId: string) => {
    setRevealedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const openIssuerWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
          {cards.map((card) => {
            const isRevealed = revealedCards.has(card.id);
            const issuerWebsite = (card as any).issuer_website;
            return (
              <div 
                key={card.id} 
                className={`rounded-lg p-4 bg-gradient-to-br ${card.card_color} text-white`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-medium">{card.name}</p>
                  <div className="flex items-center gap-2">
                    <CompanyLogo 
                      domain={issuerWebsite} 
                      name={card.name} 
                      size="sm"
                      className="bg-white/20 rounded-lg"
                    />
                    {issuerWebsite && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                        onClick={() => openIssuerWebsite(issuerWebsite)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-mono text-sm opacity-80">
                    {isRevealed ? card.card_number : `•••• •••• •••• ${card.card_number.slice(-4)}`}
                  </p>
                  <button 
                    onClick={() => toggleReveal(card.id)}
                    className="p-0.5 hover:bg-white/20 rounded transition-colors"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <CopyButton 
                    value={card.card_number.replace(/[\s-]/g, '')} 
                    label="Card number" 
                    className="text-white hover:bg-white/20"
                  />
                </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LinkedCreditCards;