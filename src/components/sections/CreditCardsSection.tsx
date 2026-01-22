import { useState } from "react";
import { Plus, CreditCard, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreditCards } from "@/hooks/usePortalData";
import { useCreateCreditCard, useUpdateCreditCard, useDeleteCreditCard } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CreditCardForm from "@/components/forms/CreditCardForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { format } from "date-fns";
import type { CreditCard as CreditCardType } from "@/hooks/usePortalData";
import type { CreditCardFormData } from "@/lib/formSchemas";

const CreditCardsSection = () => {
  const { data: creditCards, isLoading } = useCreditCards();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const createCard = useCreateCreditCard();
  const updateCard = useUpdateCreditCard();
  const deleteCard = useDeleteCreditCard();

  const handleSubmit = (data: CreditCardFormData) => {
    const cleanData = {
      ...data,
      cardholder_name: data.cardholder_name || null,
      expiry_date: data.expiry_date || null,
      minimum_payment: data.minimum_payment || null,
      due_date: data.due_date || null,
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

  const isEmpty = !creditCards || creditCards.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Credit Cards</h2>
          <p className="text-muted-foreground">View and manage your credit cards and payments.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Card
        </Button>
      </div>

      {isEmpty ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">No credit cards added yet.</p>
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Your First Card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {creditCards.map((card) => {
            const availableCredit = Number(card.credit_limit) - Number(card.current_balance);
            const usagePercent = (Number(card.current_balance) / Number(card.credit_limit)) * 100;

            return (
              <div key={card.id} className="glass-card rounded-xl overflow-hidden">
                {/* Card Visual */}
                <div className={`p-6 bg-gradient-to-br ${card.card_color} text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <CreditCard className="w-10 h-10" />
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
                    </div>
                    <p className="font-mono text-lg tracking-wider mb-4">{card.card_number}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/60">Card Holder</p>
                        <p className="font-medium">{card.cardholder_name || "CARD HOLDER"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Expires</p>
                        <p className="font-medium">{card.expiry_date || "—"}</p>
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
                      <span className="font-medium text-foreground">${Number(card.credit_limit).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Balance</span>
                      <span className="font-medium text-warning">${Number(card.current_balance).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available Credit</span>
                      <span className="font-medium text-success">${availableCredit.toLocaleString()}</span>
                    </div>
                    
                    {/* Credit Usage Bar */}
                    <div className="pt-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {usagePercent.toFixed(1)}% used
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Min. Payment Due</p>
                      <p className="font-semibold text-foreground">
                        ${card.minimum_payment?.toLocaleString() || 0}
                        {card.due_date && ` by ${format(new Date(card.due_date), "MMM d, yyyy")}`}
                      </p>
                    </div>
                    <Button size="sm">Pay Now</Button>
                  </div>
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
