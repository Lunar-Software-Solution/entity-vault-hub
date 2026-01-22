import { useState } from "react";
import { Share2, ExternalLink, CheckCircle2, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import SocialMediaForm from "@/components/forms/SocialMediaForm";
import { useCreateSocialMediaAccount, useUpdateSocialMediaAccount, useDeleteSocialMediaAccount } from "@/hooks/usePortalMutations";
import type { SocialMediaAccount } from "@/hooks/usePortalData";
import type { SocialMediaFormData } from "@/lib/formSchemas";

interface LinkedSocialMediaProps {
  accounts: SocialMediaAccount[];
  entityId: string;
}

const LinkedSocialMedia = ({ accounts, entityId }: LinkedSocialMediaProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialMediaAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<SocialMediaAccount | null>(null);

  const createMutation = useCreateSocialMediaAccount();
  const updateMutation = useUpdateSocialMediaAccount();
  const deleteMutation = useDeleteSocialMediaAccount();

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
      updateMutation.mutate({ id: editingAccount.id, ...cleanData }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(cleanData, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (account: SocialMediaAccount) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingAccount) {
      deleteMutation.mutate(deletingAccount.id, {
        onSuccess: () => setDeletingAccount(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const getAvatarUrl = (account: SocialMediaAccount) => {
    if (account.avatar_url) return account.avatar_url;
    const username = account.username.replace(/^@/, '');
    const platform = account.platform.toLowerCase();
    if (platform.includes('twitter') || platform.includes('x')) return `https://unavatar.io/twitter/${username}`;
    if (platform.includes('github')) return `https://github.com/${username}.png`;
    if (platform.includes('linkedin')) return `https://unavatar.io/linkedin/${username}`;
    if (platform.includes('instagram')) return `https://unavatar.io/instagram/${username}`;
    if (platform.includes('facebook')) return `https://unavatar.io/facebook/${username}`;
    if (platform.includes('youtube')) return `https://unavatar.io/youtube/${username}`;
    if (platform.includes('tiktok')) return `https://unavatar.io/tiktok/${username}`;
    if (platform.includes('twitch')) return `https://unavatar.io/twitch/${username}`;
    if (platform.includes('reddit')) return `https://unavatar.io/reddit/${username}`;
    if (platform.includes('telegram')) return `https://unavatar.io/telegram/${username}`;
    return null;
  };

  // Create a default account object for new accounts with the entityId pre-filled
  const getDefaultAccount = (): Partial<SocialMediaAccount> => ({
    entity_id: entityId,
    platform: "",
    username: "",
    color: "bg-zinc-800",
    is_verified: false,
  });

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Social Media</h3>
          <Badge variant="secondary" className="text-xs">{accounts.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No social media accounts linked to this entity.
        </p>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const avatarUrl = getAvatarUrl(account);
            
            return (
              <div 
                key={account.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <Avatar className="w-10 h-10 rounded-lg">
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={account.username}
                        className="object-cover"
                      />
                      <AvatarFallback className={`${account.color} text-white font-bold text-xs rounded-lg`}>
                        {account.icon || account.platform.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={`w-10 h-10 rounded-lg ${account.color} flex items-center justify-center text-white font-bold text-xs`}>
                      {account.icon || account.platform.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-foreground">{account.platform}</p>
                      {account.is_verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{account.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {account.profile_url && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={account.profile_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(account)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingAccount(account)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Social Media Account" : "Add Social Media Account"}
            </DialogTitle>
          </DialogHeader>
          <SocialMediaForm
            account={editingAccount || getDefaultAccount() as SocialMediaAccount}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingAccount}
        onOpenChange={() => setDeletingAccount(null)}
        onConfirm={handleDelete}
        title="Delete Social Media Account"
        description={`Are you sure you want to delete the ${deletingAccount?.platform} account "${deletingAccount?.username}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedSocialMedia;
