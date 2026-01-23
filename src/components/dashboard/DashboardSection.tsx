import { Wallet, CreditCard, Share2, FileText, MapPin, Building2, Calendar, CheckSquare, Phone, Receipt, Briefcase, FolderOpen, Plus, Edit, Trash2, Activity } from "lucide-react";
import StatCard from "./StatCard";
import { useDashboardStats, useUpcomingFilings, useOpenTasks, useRecentAuditLogs, useContracts, useEntityDocuments } from "@/hooks/usePortalData";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getCompactChangeSummary } from "@/lib/auditLogUtils";

interface DashboardSectionProps {
  onNavigate?: (section: string) => void;
}

// Helper to get action icon
const getActionIcon = (action: string) => {
  switch (action) {
    case "INSERT": return Plus;
    case "UPDATE": return Edit;
    case "DELETE": return Trash2;
    default: return Activity;
  }
};

// Helper to get status color for contracts
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "active": return "default";
    case "expiring-soon": return "secondary";
    case "expired": return "destructive";
    default: return "outline";
  }
};

const DashboardSection = ({ onNavigate }: DashboardSectionProps) => {
  const stats = useDashboardStats();
  const { data: upcomingFilings, isLoading: loadingFilings } = useUpcomingFilings();
  const { data: openTasks, isLoading: loadingTasks } = useOpenTasks();
  const { data: auditLogs, isLoading: loadingAudit } = useRecentAuditLogs(6);
  const { data: contracts, isLoading: loadingContracts } = useContracts();
  const { data: documents, isLoading: loadingDocuments } = useEntityDocuments();

  const isLoading = loadingFilings || loadingTasks || loadingAudit || loadingContracts || loadingDocuments;
  
  const overdueFilings = upcomingFilings?.filter(f => f.status === "overdue" || new Date(f.due_date) < new Date()).length || 0;
  const urgentTasks = openTasks?.filter(t => t.priority === "urgent" || t.priority === "high").length || 0;

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

      {/* Bottom Grid: Recent Activity, Upcoming Tasks, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity from Audit Logs */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          {auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                const summary = getCompactChangeSummary(
                  log.action,
                  log.table_name,
                  log.old_values,
                  log.new_values
                );
                return (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className={`p-1.5 rounded-full flex-shrink-0 ${
                      log.action === "INSERT" ? "bg-green-500/10 text-green-500" :
                      log.action === "UPDATE" ? "bg-blue-500/10 text-blue-500" :
                      log.action === "DELETE" ? "bg-red-500/10 text-red-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      <ActionIcon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {summary.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {summary.detail ? `${summary.detail} • ` : ""}by {log.user_email?.split("@")[0] || "System"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Tasks</h3>
          {openTasks && openTasks.length > 0 ? (
            <div className="space-y-4">
              {openTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-start justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge 
                    variant={task.priority === "urgent" || task.priority === "high" ? "destructive" : "secondary"}
                    className="ml-2 flex-shrink-0"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckSquare className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No pending tasks</p>
            </div>
          )}
        </div>

        {/* Recent Contracts & Documents */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Files</h3>
          <div className="space-y-2">
            {/* Recent Contracts */}
            {contracts && contracts.slice(0, 3).map((contract) => (
              <button
                key={contract.id}
                onClick={() => onNavigate?.("contracts")}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-500 flex-shrink-0">
                  <FileText className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contract.title}</p>
                  <p className="text-xs text-muted-foreground">Contract • {contract.type}</p>
                </div>
                <Badge variant={getStatusVariant(contract.status)} className="flex-shrink-0 text-xs">
                  {contract.status}
                </Badge>
              </button>
            ))}
            
            {/* Recent Documents */}
            {documents && documents.slice(0, 3).map((doc) => (
              <button
                key={doc.id}
                onClick={() => onNavigate?.("documents")}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500 flex-shrink-0">
                  <FolderOpen className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">Document • {doc.status}</p>
                </div>
                {doc.expiry_date && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    Exp: {format(new Date(doc.expiry_date), "MMM d")}
                  </span>
                )}
              </button>
            ))}
            
            {(!contracts || contracts.length === 0) && (!documents || documents.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No files yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;