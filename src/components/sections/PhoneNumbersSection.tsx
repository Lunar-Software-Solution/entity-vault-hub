import { useState } from "react";
import { usePhoneNumbers, useEntities, type PhoneNumber } from "@/hooks/usePortalData";
import { useCreatePhoneNumber, useUpdatePhoneNumber, useDeletePhoneNumber } from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import PhoneNumberForm from "@/components/forms/PhoneNumberForm";
import { Phone, Plus, MoreHorizontal, Edit, Trash2, Star, Building2 } from "lucide-react";
import type { PhoneNumberFormData } from "@/lib/formSchemas";

interface PhoneNumbersSectionProps {
  entityFilter?: string | null;
}

const PhoneNumbersSection = ({ entityFilter }: PhoneNumbersSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneNumber | null>(null);
  const [deletingPhone, setDeletingPhone] = useState<PhoneNumber | null>(null);

  const { data: phoneNumbers, isLoading: phonesLoading } = usePhoneNumbers();
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  
  const createMutation = useCreatePhoneNumber();
  const updateMutation = useUpdatePhoneNumber();
  const deleteMutation = useDeletePhoneNumber();

  const isLoading = phonesLoading || entitiesLoading;

  const filteredPhones = entityFilter
    ? phoneNumbers?.filter(p => p.entity_id === entityFilter)
    : phoneNumbers;

  const getEntityName = (entityId: string) => {
    return entities?.find(e => e.id === entityId)?.name ?? "Unknown Entity";
  };

  const handleSubmit = (data: PhoneNumberFormData) => {
    const payload = {
      ...data,
      purpose: data.purpose || null,
    };

    if (editingPhone) {
      updateMutation.mutate({ id: editingPhone.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (phone: PhoneNumber) => {
    setEditingPhone(phone);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingPhone) {
      deleteMutation.mutate(deletingPhone.id, {
        onSuccess: () => setDeletingPhone(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPhone(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Phone Numbers</h2>
          <p className="text-muted-foreground">Manage phone numbers for your entities</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Phone
        </Button>
      </div>

      {!filteredPhones?.length ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No phone numbers added yet</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Phone Number
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhones.map((phone) => (
            <div key={phone.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{phone.label}</span>
                      {phone.is_primary && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-lg font-mono text-foreground">
                      {phone.country_code} {phone.phone_number}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(phone)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeletingPhone(phone)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{getEntityName(phone.entity_id)}</span>
                </div>
                {phone.purpose && (
                  <Badge variant="secondary" className="text-xs">
                    {phone.purpose}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPhone ? "Edit Phone Number" : "Add Phone Number"}
            </DialogTitle>
          </DialogHeader>
          <PhoneNumberForm
            phoneNumber={editingPhone}
            defaultEntityId={entityFilter ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingPhone}
        onOpenChange={() => setDeletingPhone(null)}
        onConfirm={handleDelete}
        title="Delete Phone Number"
        description={`Are you sure you want to delete "${deletingPhone?.country_code} ${deletingPhone?.phone_number}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default PhoneNumbersSection;
