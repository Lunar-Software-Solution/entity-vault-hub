import { useState } from "react";
import { Phone, Star, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import PhoneNumberForm from "@/components/forms/PhoneNumberForm";
import { useCreatePhoneNumber, useUpdatePhoneNumber, useDeletePhoneNumber } from "@/hooks/usePortalMutations";
import type { PhoneNumber } from "@/hooks/usePortalData";
import type { PhoneNumberFormData } from "@/lib/formSchemas";

interface LinkedPhoneNumbersProps {
  phones: PhoneNumber[];
  entityId: string;
}

const LinkedPhoneNumbers = ({ phones, entityId }: LinkedPhoneNumbersProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneNumber | null>(null);
  const [deletingPhone, setDeletingPhone] = useState<PhoneNumber | null>(null);

  const createMutation = useCreatePhoneNumber();
  const updateMutation = useUpdatePhoneNumber();
  const deleteMutation = useDeletePhoneNumber();

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

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Phone Numbers</h3>
          <Badge variant="secondary" className="text-xs">{phones.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {phones.length === 0 ? (
        <p className="text-sm text-muted-foreground">No phone numbers linked</p>
      ) : (
        <div className="space-y-3">
          {phones.map((phone) => (
            <div key={phone.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{phone.label}</span>
                    {phone.is_primary && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <button
                    onClick={() => handleEdit(phone)}
                    className="text-sm font-mono text-muted-foreground hover:text-primary hover:underline cursor-pointer transition-colors text-left"
                  >
                    {phone.country_code} {phone.phone_number}
                  </button>
                  {phone.purpose && (
                    <p className="text-xs text-muted-foreground">{phone.purpose}</p>
                  )}
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
            defaultEntityId={entityId}
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
        description={`Are you sure you want to delete "${deletingPhone?.country_code} ${deletingPhone?.phone_number}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedPhoneNumbers;
