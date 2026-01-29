import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useUserRole } from "@/hooks/useUserRole";
import type { PhoneNumberFormData } from "@/lib/formSchemas";
import { supabase } from "@/integrations/supabase/client";

interface PhoneNumbersSectionProps {
  entityFilter?: string | null;
}

// Hook to fetch all phone number entity links
const usePhoneEntityLinks = () => {
  return useQuery({
    queryKey: ["phone-entity-links-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phone_number_entity_links")
        .select(`
          id,
          phone_number_id,
          entity_id,
          is_primary,
          role,
          entity:entities(id, name)
        `);
      if (error) throw error;
      return data;
    },
  });
};

const PhoneNumbersSection = ({ entityFilter }: PhoneNumbersSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneNumber | null>(null);
  const [deletingPhone, setDeletingPhone] = useState<PhoneNumber | null>(null);

  const { data: phoneNumbers, isLoading: phonesLoading } = usePhoneNumbers();
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { data: phoneEntityLinks } = usePhoneEntityLinks();
  const { canWrite } = useUserRole();
  
  const createMutation = useCreatePhoneNumber();
  const updateMutation = useUpdatePhoneNumber();
  const deleteMutation = useDeletePhoneNumber();

  const isLoading = phonesLoading || entitiesLoading;

  // Get linked entities for a phone number
  const getLinkedEntities = (phoneId: string) => {
    if (!phoneEntityLinks) return [];
    return phoneEntityLinks
      .filter(link => link.phone_number_id === phoneId)
      .map(link => ({
        id: link.entity_id,
        name: (link.entity as any)?.name || "Unknown",
        is_primary: link.is_primary,
      }));
  };

  // Filter phones by entity using junction table
  const filteredPhones = useMemo(() => {
    if (!phoneNumbers) return [];
    if (!entityFilter) return phoneNumbers;
    
    // Get phone IDs that are linked to the filtered entity
    const linkedPhoneIds = phoneEntityLinks
      ?.filter(link => link.entity_id === entityFilter)
      .map(link => link.phone_number_id) || [];
    
    // Also include phones with the legacy entity_id
    return phoneNumbers.filter(phone => 
      linkedPhoneIds.includes(phone.id) || phone.entity_id === entityFilter
    );
  }, [phoneNumbers, entityFilter, phoneEntityLinks]);

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
        {canWrite && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Phone
          </Button>
        )}
      </div>

      {!filteredPhones?.length ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No phone numbers added yet</p>
          {canWrite && (
            <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2 border-border text-foreground hover:bg-muted">
              <Plus className="w-4 h-4" />
              Add Your First Phone Number
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhones.map((phone) => {
            const linkedEntities = getLinkedEntities(phone.id);
            
            return (
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
                  {canWrite && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground">
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
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {/* Show linked entities from junction table */}
                  {linkedEntities.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      {linkedEntities.map((entity, idx) => (
                        <span key={entity.id}>
                          {entity.name}
                          {entity.is_primary && <span className="text-primary ml-1">(Primary)</span>}
                          {idx < linkedEntities.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  )}
                  {phone.purpose && (
                    <Badge variant="secondary" className="text-xs">
                      {phone.purpose}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
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
