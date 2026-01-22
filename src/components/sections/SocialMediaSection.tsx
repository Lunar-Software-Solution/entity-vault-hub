import { Plus, ExternalLink, MoreVertical, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocialMediaAccounts } from "@/hooks/usePortalData";
import { Skeleton } from "@/components/ui/skeleton";

const SocialMediaSection = () => {
  const { data: socialAccounts, isLoading } = useSocialMediaAccounts();

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
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Link Account
        </Button>
      </div>

      {isEmpty ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-4">No social media accounts linked yet.</p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Link Your First Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialAccounts.map((account) => (
            <div key={account.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${account.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {account.icon || account.platform.charAt(0)}
                  </div>
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
                <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

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
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaSection;
