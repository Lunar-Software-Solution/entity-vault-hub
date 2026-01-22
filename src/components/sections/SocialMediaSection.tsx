import { Plus, ExternalLink, MoreVertical, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const socialAccounts = [
  {
    id: 1,
    platform: "LinkedIn",
    username: "@johndoe",
    profileUrl: "linkedin.com/in/johndoe",
    followers: "5.2K",
    verified: true,
    icon: "in",
    color: "bg-blue-600"
  },
  {
    id: 2,
    platform: "Twitter / X",
    username: "@johndoe_biz",
    profileUrl: "x.com/johndoe_biz",
    followers: "12.4K",
    verified: true,
    icon: "X",
    color: "bg-zinc-900"
  },
  {
    id: 3,
    platform: "Instagram",
    username: "@johndoe.official",
    profileUrl: "instagram.com/johndoe.official",
    followers: "8.1K",
    verified: false,
    icon: "📷",
    color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
  },
  {
    id: 4,
    platform: "Facebook",
    username: "John Doe Business",
    profileUrl: "facebook.com/johndoebusiness",
    followers: "3.2K",
    verified: true,
    icon: "f",
    color: "bg-blue-700"
  },
  {
    id: 5,
    platform: "GitHub",
    username: "@johndoe-dev",
    profileUrl: "github.com/johndoe-dev",
    followers: "892",
    verified: false,
    icon: "GH",
    color: "bg-zinc-800"
  },
  {
    id: 6,
    platform: "YouTube",
    username: "John Doe Channel",
    profileUrl: "youtube.com/@johndoe",
    followers: "15.6K",
    verified: true,
    icon: "▶",
    color: "bg-red-600"
  }
];

const SocialMediaSection = () => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {socialAccounts.map((account) => (
          <div key={account.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${account.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {account.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-foreground">{account.platform}</h3>
                    {account.verified && (
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
                <p className="font-semibold text-foreground">{account.followers}</p>
              </div>
              <a 
                href={`https://${account.profileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaSection;
