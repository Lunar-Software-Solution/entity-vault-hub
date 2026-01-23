import { useState } from "react";
import type { CreditCard } from "@/hooks/usePortalData";
import { CreditCard as CreditCardIcon, Eye, EyeOff, ExternalLink } from "lucide-react";
import CompanyLogo from "@/components/shared/CompanyLogo";
import CopyButton from "@/components/shared/CopyButton";
import CardBrandIcon from "@/components/shared/CardBrandIcon";
import { detectCardBrand } from "@/lib/cardBrandUtils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  const maskCardNumber = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length <= 4) return number;
    return `****-****-****-${cleanNumber.slice(-4)}`;
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
        <div className="space-y-4">
          {cards.map((card) => {
            const isRevealed = revealedCards.has(card.id);
            const issuerWebsite = (card as any).issuer_website;
            return (
              <div key={card.id} className="rounded-xl overflow-hidden border border-border/50">
                {/* Card Visual */}
                <div className={`p-4 bg-gradient-to-br ${card.card_color} text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <CompanyLogo 
                        domain={issuerWebsite} 
                        name={card.name} 
                        size="sm"
                        className="bg-white/20 rounded-lg"
                      />
                      <div className="flex items-center gap-2">
                        <CardBrandIcon brand={detectCardBrand(card.card_number)} size="sm" />
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
                    
                    {/* Card Number */}
                    <div className="flex items-center gap-2 mb-3">
                      <p className="font-mono text-base tracking-wider">
                        {isRevealed ? card.card_number : maskCardNumber(card.card_number)}
                      </p>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleReveal(card.id);
                        }}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title={isRevealed ? "Hide details" : "Show details"}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <CopyButton 
                        value={card.card_number.replace(/[\s-]/g, '')} 
                        label="Card number" 
                        className="text-white hover:bg-white/20"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-xs text-white/60">Cardholder</p>
                        <p className="font-medium">{card.cardholder_name || "CARD HOLDER"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60">Expires</p>
                        <p className="font-medium">{card.expiry_date || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{card.name}</h4>
                    <span className="font-semibold text-foreground">{formatCurrency(Number(card.credit_limit))}</span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Credit Limit */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Credit Limit</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-foreground">{formatCurrency(Number(card.credit_limit))}</span>
                        <CopyButton value={formatCurrency(Number(card.credit_limit))} label="Credit limit" />
                      </div>
                    </div>

                    {/* Expiry Date */}
                    {card.expiry_date && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Expiry Date</p>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm text-foreground">{card.expiry_date}</span>
                          <CopyButton value={card.expiry_date} label="Expiry date" />
                        </div>
                      </div>
                    )}

                    {/* Due Date */}
                    {card.due_date && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Due Date</p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-foreground">{format(new Date(card.due_date), "MMM d, yyyy")}</span>
                          <CopyButton value={format(new Date(card.due_date), "MMM d, yyyy")} label="Due date" />
                        </div>
                      </div>
                    )}

                    {/* Security Code */}
                    {(card as any).security_code && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Security Code</p>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm text-foreground">
                            {isRevealed ? (card as any).security_code : "***"}
                          </span>
                          <CopyButton value={(card as any).security_code} label="Security code" />
                        </div>
                      </div>
                    )}

                    {/* Cardholder Name */}
                    {card.cardholder_name && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Cardholder</p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-foreground">{card.cardholder_name}</span>
                          <CopyButton value={card.cardholder_name} label="Cardholder name" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Billing Address */}
                  {(card as any).billing_address && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-0.5">Billing Address</p>
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-foreground flex-1">{(card as any).billing_address}</p>
                        <CopyButton value={(card as any).billing_address} label="Billing address" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LinkedCreditCards;