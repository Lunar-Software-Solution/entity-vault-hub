import { Wallet, CreditCard, Share2, FileText, MapPin, Building2, Calendar, CheckSquare, Phone, Receipt, Briefcase, FolderOpen } from "lucide-react";
import StatCard from "./StatCard";
import { useDashboardStats, useBankAccounts, useContracts, useUpcomingFilings, useOpenTasks } from "@/hooks/usePortalData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface DashboardSectionProps {
  onNavigate?: (section: string) => void;
}

const DashboardSection = ({ onNavigate }: DashboardSectionProps) => {
  const stats = useDashboardStats();
  const { data: bankAccounts, isLoading: loadingBanks } = useBankAccounts();
  const { data: contracts, isLoading: loadingContracts } = useContracts();
  const { data: upcomingFilings, isLoading: loadingFilings } = useUpcomingFilings();
  const { data: openTasks, isLoading: loadingTasks } = useOpenTasks();

  const isLoading = loadingBanks || loadingContracts || loadingFilings || loadingTasks;
  
  const overdueFilings = upcomingFilings?.filter(f => f.status === "overdue" || new Date(f.due_date) < new Date()).length || 0;
  const urgentTasks = openTasks?.filter(t => t.priority === "urgent" || t.priority === "high").length || 0;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Corporate */}
        <StatCard
          title="Entities"
          value={stats.entityCount.toString()}
          subtitle={stats.entityStatus === "Active" ? "Active entity" : "Register your entity"}
          icon={Building2}
          variant={stats.entityStatus === "Active" ? "success" : "default"}
          onClick={() => onNavigate?.("entity")}
        />
        <StatCard
          title="Upcoming Filings"
          value={(upcomingFilings?.length || 0).toString()}
          subtitle={overdueFilings > 0 ? `${overdueFilings} overdue` : "All filings current"}
          icon={Calendar}
          variant={overdueFilings > 0 ? "warning" : "default"}
          onClick={() => onNavigate?.("filings")}
        />
        <StatCard
          title="Open Tasks"
          value={(openTasks?.length || 0).toString()}
          subtitle={urgentTasks > 0 ? `${urgentTasks} high priority` : "No urgent tasks"}
          icon={CheckSquare}
          variant={urgentTasks > 0 ? "warning" : "success"}
          onClick={() => onNavigate?.("filings")}
        />
        <StatCard
          title="Service Providers"
          value={stats.totalServiceProviders.toString()}
          subtitle={`${stats.activeServiceProviders} active`}
          icon={Briefcase}
          variant="default"
          onClick={() => onNavigate?.("service-providers")}
        />

        {/* Financial */}
        <StatCard
          title="Bank Accounts"
          value={stats.bankAccountCount.toString()}
          subtitle="Connected accounts"
          icon={Wallet}
          variant="primary"
          onClick={() => onNavigate?.("bank-accounts")}
        />
        <StatCard
          title="Credit Cards"
          value={stats.creditCardCount.toString()}
          subtitle={`$${stats.totalCreditLimit.toLocaleString()} total limit`}
          icon={CreditCard}
          variant="warning"
          onClick={() => onNavigate?.("credit-cards")}
        />
        <StatCard
          title="Tax IDs"
          value={stats.taxIdCount.toString()}
          subtitle="Registered tax identifiers"
          icon={Receipt}
          variant="default"
          onClick={() => onNavigate?.("tax-ids")}
        />

        {/* Contact */}
        <StatCard
          title="Phone Numbers"
          value={stats.phoneNumberCount.toString()}
          subtitle="Registered numbers"
          icon={Phone}
          variant="default"
          onClick={() => onNavigate?.("phone-numbers")}
        />
        <StatCard
          title="Social Accounts"
          value={stats.socialAccountCount.toString()}
          subtitle="Connected platforms"
          icon={Share2}
          variant="default"
          onClick={() => onNavigate?.("social-media")}
        />
        <StatCard
          title="Addresses"
          value={stats.addressCount.toString()}
          subtitle="Saved locations"
          icon={MapPin}
          variant="default"
          onClick={() => onNavigate?.("addresses")}
        />

        {/* Legal & Docs */}
        <StatCard
          title="Documents"
          value={stats.documentCount.toString()}
          subtitle="Stored documents"
          icon={FolderOpen}
          variant="default"
          onClick={() => onNavigate?.("documents")}
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts.toString()}
          subtitle={stats.expiringContracts > 0 ? `${stats.expiringContracts} expiring soon` : "All contracts current"}
          icon={FileText}
          variant="success"
          onClick={() => onNavigate?.("contracts")}
        />
      </div>

      {/* Recent Activity */}
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
    </div>
  );
};

export default DashboardSection;