import { useState } from "react";
import { Plus, CreditCard, MoreVertical, Edit2, Trash2, Building2, Eye, EyeOff, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreditCards, useEntities } from "@/hooks/usePortalData";
import { useCreateCreditCard, useUpdateCreditCard, useDeleteCreditCard } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CreditCardForm from "@/components/forms/CreditCardForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import CompanyLogo from "@/components/shared/CompanyLogo";
import CopyButton from "@/components/shared/CopyButton";
import CardBrandIcon from "@/components/shared/CardBrandIcon";
import { detectCardBrand, getCardBrandInfo } from "@/lib/cardBrandUtils";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import type { CreditCard as CreditCardType } from "@/hooks/usePortalData";
import type { CreditCardFormData } from "@/lib/formSchemas";

interface CreditCardsSectionProps {
  entityFilter?: string | null;
}

const CreditCardsSection = ({ entityFilter }: CreditCardsSectionProps) => {
  const { data: creditCards, isLoading } = useCreditCards();
  const { data: entities } = useEntities();
  const { canWrite } = useUserRole();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [copiedAll, setCopiedAll] = useState(false);
  
  const createCard = useCreateCreditCard();
  const updateCard = useUpdateCreditCard();
  const deleteCard = useDeleteCreditCard();

  const handleSubmit = (data: CreditCardFormData) => {
    const cleanData = {
      ...data,
      cardholder_name: data.cardholder_name || null,
      expiry_date: data.expiry_date || null,
      due_date: data.due_date || null,
      issuer_website: data.issuer_website || null,
      entity_id: data.entity_id || null,
      security_code: data.security_code || null,
      billing_address: data.billing_address || null,
    };
    
    if (editingCard) {
      updateCard.mutate({ id: editingCard.id, ...cleanData }, { 
        onSuccess: () => { setIsFormOpen(false); setEditingCard(null); }
      });
    } else {
      createCard.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleEdit = (card: CreditCardType) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteCard.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCard(null);
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

  const maskCardNumber = (number: string): string => {
    // Show only last 4 digits
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length <= 4) return number;
    const lastFour = cleanNumber.slice(-4);
    return `****-****-****-${lastFour}`;
  };

  const openIssuerWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatAllCards = (cards: CreditCardType[]): string => {
    return cards.map(card => {
      const lines = [
        `💳 ${card.name}`,
      ];
      
      if (card.cardholder_name) {
        lines.push(`Cardholder: ${card.cardholder_name}`);
      }
      lines.push(`Card Number: ${card.card_number}`);
      
      if (card.expiry_date) {
        lines.push(`Expiry: ${card.expiry_date}`);
      }
      if ((card as any).security_code) {
        lines.push(`CVV: ${(card as any).security_code}`);
      }
      lines.push(`Credit Limit: $${Number(card.credit_limit).toLocaleString()}`);
      
      if (card.due_date) {
        lines.push(`Due Date: ${format(new Date(card.due_date), "MMM d, yyyy")}`);
      }
      if ((card as any).billing_address) {
        lines.push(`Billing Address: ${(card as any).billing_address}`);
      }
      
      return lines.join('\n');
    }).join('\n\n---\n\n');
  };

  const copyAllCards = async () => {
    if (filteredCards.length === 0) return;
    
    const text = formatAllCards(filteredCards);
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    toast.success(`Copied ${filteredCards.length} credit card(s) to clipboard`);
    setTimeout(() => setCopiedAll(false), 2000);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const filteredCards = entityFilter 
    ? (creditCards ?? []).filter(card => card.entity_id === entityFilter)
    : (creditCards ?? []);

  const isEmpty = filteredCards.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Credit Cards</h2>
          <p className="text-muted-foreground">
            {entityFilter 
              ? `Showing cards for selected entity (${filteredCards.length} of ${creditCards?.length ?? 0})`
              : "View and manage your credit cards."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filteredCards.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={copyAllCards}>
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy All
            </Button>
          )}
          {canWrite && (
            <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Card
            </Button>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {entityFilter ? "No credit cards linked to this entity." : "No credit cards added yet."}
          </p>
          {canWrite && (
            <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Card
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCards.map((card) => {
            const linkedEntity = entities?.find(e => e.id === card.entity_id);
            const isRevealed = revealedCards.has(card.id);
            const issuerWebsite = (card as any).issuer_website;
            return (
              <div key={card.id} className="glass-card rounded-xl overflow-hidden">
                {/* Card Visual */}
                <div className={`p-6 bg-gradient-to-br ${card.card_color} text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <CompanyLogo 
                        domain={issuerWebsite} 
                        name={card.name} 
                        size="sm"
                        className="bg-white/20 rounded-lg"
                      />
                      <div className="flex items-center gap-2">
                        {/* Card Brand Icon */}
                        <CardBrandIcon brand={detectCardBrand(card.card_number)} size="md" />
                        {canWrite && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-white/20 rounded transition-colors">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(card)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeletingId(card.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    
                    {/* Card Number with Reveal Toggle and Copy */}
                    <div className="flex items-center gap-2 mb-4">
                      <p className="font-mono text-lg tracking-wider">
                        {isRevealed ? card.card_number : maskCardNumber(card.card_number)}
                      </p>
                      <button 
                        onClick={() => toggleReveal(card.id)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title={isRevealed ? "Hide card number" : "Show card number"}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <CopyButton 
                        value={card.card_number.replace(/[\s-]/g, '')} 
                        label="Card number" 
                        className="text-white hover:bg-white/20"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60">Card Holder</p>
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
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{card.name}</h3>
                    <div className="flex items-center gap-2">
                      {linkedEntity && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                          <Building2 className="w-3 h-3 text-primary" />
                          <span className="text-xs text-primary">{linkedEntity.name}</span>
                        </div>
                      )}
                      {issuerWebsite && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1 h-7 px-2"
                          onClick={() => openIssuerWebsite(issuerWebsite)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-0.5">Credit Limit</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground">${Number(card.credit_limit).toLocaleString()}</span>
                        <CopyButton value={Number(card.credit_limit).toLocaleString()} label="Credit limit" />
                      </div>
                    </div>
                    {card.due_date && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-0.5">Due Date</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">{format(new Date(card.due_date), "MMM d, yyyy")}</span>
                          <CopyButton value={format(new Date(card.due_date), "MMM d, yyyy")} label="Due date" />
                        </div>
                      </div>
                    )}
                    {card.expiry_date && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-0.5">Expiry Date</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-foreground">{card.expiry_date}</span>
                          <CopyButton value={card.expiry_date} label="Expiry date" />
                        </div>
                      </div>
                    )}
                    {(card as any).security_code && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-0.5">Security Code</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-foreground">
                            {isRevealed ? (card as any).security_code : "***"}
                          </span>
                          <CopyButton value={(card as any).security_code} label="Security code" />
                        </div>
                      </div>
                    )}
                    {card.cardholder_name && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-0.5">Cardholder</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-foreground">{card.cardholder_name}</span>
                          <CopyButton value={card.cardholder_name} label="Cardholder name" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Billing Address */}
                  {(card as any).billing_address && (
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Billing Address</p>
                          <p className="text-sm text-foreground">{(card as any).billing_address}</p>
                        </div>
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

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCard ? "Edit Credit Card" : "Add Credit Card"}</DialogTitle>
          </DialogHeader>
          <CreditCardForm
            card={editingCard}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createCard.isPending || updateCard.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Credit Card"
        description="This will permanently delete this credit card."
        isLoading={deleteCard.isPending}
      />
    </div>
  );
};

export default CreditCardsSection;