import type { SocialMediaAccount } from "@/hooks/usePortalData";
import { Share2, ExternalLink, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface LinkedSocialMediaProps {
  accounts: SocialMediaAccount[];
}

const LinkedSocialMedia = ({ accounts }: LinkedSocialMediaProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Social Media</h3>
          <p className="text-sm text-muted-foreground">{accounts.length} linked</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No social media accounts linked to this entity.
        </p>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div 
              key={account.id} 
              className="bg-muted/30 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {account.avatar_url ? (
                    <Avatar className="w-10 h-10 rounded-lg">
                      <AvatarImage 
                        src={account.avatar_url} 
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
                {account.profile_url && (
                  <a 
                    href={account.profile_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>
              {account.followers && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {account.followers} followers
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedSocialMedia;
