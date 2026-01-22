import { Wallet, CreditCard, Share2, FileText, MapPin, Building2 } from "lucide-react";
import StatCard from "./StatCard";
import { useDashboardStats, useBankAccounts, useContracts } from "@/hooks/usePortalData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const DashboardSection = () => {
  const stats = useDashboardStats();
  const { data: bankAccounts, isLoading: loadingBanks } = useBankAccounts();
  const { data: contracts, isLoading: loadingContracts } = useContracts();

  const isLoading = loadingBanks || loadingContracts;

  // Build recent activity from actual data
  const recentActivity = [
    ...(bankAccounts?.slice(0, 2).map(acc => ({
      action: "Bank account added",
      item: acc.name,
      time: format(new Date(acc.created_at), "MMM d, yyyy")
    })) ?? []),
    ...(contracts?.slice(0, 2).map(c => ({
      action: "Contract created",
      item: c.title,
      time: format(new Date(c.created_at), "MMM d, yyyy")
    })) ?? [])
  ].slice(0, 4);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Bank Balance"
          value={`$${stats.totalBankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`Across ${stats.bankAccountCount} account${stats.bankAccountCount !== 1 ? "s" : ""}`}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Credit Card Limit"
          value={`$${stats.totalCreditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${stats.creditCardCount} active card${stats.creditCardCount !== 1 ? "s" : ""}`}
          icon={CreditCard}
          variant="warning"
        />
        <StatCard
          title="Social Accounts"
          value={stats.socialAccountCount.toString()}
          subtitle="Connected platforms"
          icon={Share2}
          variant="default"
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts.toString()}
          subtitle={stats.expiringContracts > 0 ? `${stats.expiringContracts} expiring soon` : "All contracts current"}
          icon={FileText}
          variant="success"
        />
        <StatCard
          title="Registered Addresses"
          value={stats.addressCount.toString()}
          subtitle="Saved locations"
          icon={MapPin}
          variant="default"
        />
        <StatCard
          title="Entity Status"
          value={stats.entityStatus}
          subtitle={stats.entityFoundedDate 
            ? `Since ${format(new Date(stats.entityFoundedDate), "MMM yyyy")}` 
            : "Register your entity"}
          icon={Building2}
          variant={stats.entityStatus === "Active" ? "success" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No recent activity. Start by adding some data!</p>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Bank Account", icon: Wallet },
              { label: "New Contract", icon: FileText },
              { label: "Link Social", icon: Share2 },
              { label: "Add Address", icon: MapPin },
            ].map((action, index) => (
              <button
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all duration-200 text-sm font-medium"
              >
                <action.icon className="w-5 h-5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
