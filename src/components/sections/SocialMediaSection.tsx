import { useState, useMemo } from "react";
import { Plus, ExternalLink, MoreVertical, CheckCircle2, Edit2, Trash2, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSocialMediaAccounts, useEntities } from "@/hooks/usePortalData";
import { useCreateSocialMediaAccount, useUpdateSocialMediaAccount, useDeleteSocialMediaAccount } from "@/hooks/usePortalMutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SocialMediaForm from "@/components/forms/SocialMediaForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import type { SocialMediaAccount } from "@/hooks/usePortalData";
import type { SocialMediaFormData } from "@/lib/formSchemas";

interface SocialMediaSectionProps {
  entityFilter?: string | null;
}

const SocialMediaSection = ({ entityFilter }: SocialMediaSectionProps) => {
  const { data: socialAccounts, isLoading } = useSocialMediaAccounts();
  const { data: entities } = useEntities();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialMediaAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const createAccount = useCreateSocialMediaAccount();
  const updateAccount = useUpdateSocialMediaAccount();
  const deleteAccount = useDeleteSocialMediaAccount();

  // Filter accounts by entity if filter is set
  const filteredAccounts = useMemo(() => {
    if (!socialAccounts) return [];
    if (!entityFilter) return socialAccounts;
    return socialAccounts.filter(account => account.entity_id === entityFilter);
  }, [socialAccounts, entityFilter]);

  // Get entity name by ID
  const getEntityName = (entityId: string | null) => {
    if (!entityId || !entities) return null;
    return entities.find(e => e.id === entityId)?.name || null;
  };

  const handleSubmit = (data: SocialMediaFormData) => {
    const cleanData = {
      ...data,
      profile_url: data.profile_url || null,
      followers: data.followers || null,
      icon: data.icon || null,
      entity_id: data.entity_id === "__none__" ? null : (data.entity_id || null),
      avatar_url: data.avatar_url || null,
    };
    
    if (editingAccount) {
      updateAccount.mutate({ id: editingAccount.id, ...cleanData }, { 
        onSuccess: () => { setIsFormOpen(false); setEditingAccount(null); }
      });
    } else {
      createAccount.mutate(cleanData, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleEdit = (account: SocialMediaAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteAccount.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !socialAccounts || socialAccounts.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Social Media</h2>
          <p className="text-muted-foreground">Manage your connected social media accounts.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4" />
          Link Account
        </Button>
      </div>

      {filteredAccounts.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {entityFilter ? "No social media accounts linked to this entity." : "No social media accounts linked yet."}
          </p>
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Link Your First Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => {
            const entityName = getEntityName(account.entity_id);
            return (
              <div key={account.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {account.avatar_url ? (
                      <Avatar className="w-12 h-12 rounded-xl">
                        <AvatarImage 
                          src={account.avatar_url} 
                          alt={account.username}
                          className="object-cover"
                        />
                        <AvatarFallback className={`${account.color} text-white font-bold text-sm rounded-xl`}>
                          {account.icon || account.platform.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl ${account.color} flex items-center justify-center text-white font-bold text-sm`}>
                        {account.icon || account.platform.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-foreground">{account.platform}</h3>
                        {account.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{account.username}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(account)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingId(account.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {entityName && (
                  <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span>{entityName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="font-semibold text-foreground">{account.followers || "—"}</p>
                  </div>
                  {account.profile_url && (
                    <a 
                      href={account.profile_url.startsWith("http") ? account.profile_url : `https://${account.profile_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Visit <ExternalLink className="w-3 h-3" />
                    </a>
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
            <DialogTitle>{editingAccount ? "Edit Social Media Account" : "Link Social Media Account"}</DialogTitle>
          </DialogHeader>
          <SocialMediaForm
            account={editingAccount}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createAccount.isPending || updateAccount.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Remove Social Media Account"
        description="This will remove this social media account from your portal."
        isLoading={deleteAccount.isPending}
      />
    </div>
  );
};

export default SocialMediaSection;
