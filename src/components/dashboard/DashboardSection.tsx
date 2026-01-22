import { Wallet, CreditCard, Share2, FileText, MapPin, Building2 } from "lucide-react";
import StatCard from "./StatCard";

const DashboardSection = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Bank Balance"
          value="$124,580.00"
          subtitle="Across 3 accounts"
          icon={Wallet}
          variant="primary"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Credit Card Limit"
          value="$45,000.00"
          subtitle="2 active cards"
          icon={CreditCard}
          variant="warning"
        />
        <StatCard
          title="Social Accounts"
          value="8"
          subtitle="Connected platforms"
          icon={Share2}
          variant="default"
        />
        <StatCard
          title="Active Contracts"
          value="5"
          subtitle="2 expiring soon"
          icon={FileText}
          variant="success"
        />
        <StatCard
          title="Registered Addresses"
          value="3"
          subtitle="Home, Office, Shipping"
          icon={MapPin}
          variant="default"
        />
        <StatCard
          title="Entity Status"
          value="Active"
          subtitle="Since Jan 2020"
          icon={Building2}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: "Contract renewed", item: "Office Lease Agreement", time: "2 hours ago" },
              { action: "Bank statement received", item: "Chase Business", time: "1 day ago" },
              { action: "Credit card payment", item: "Amex Platinum", time: "3 days ago" },
              { action: "Address updated", item: "Shipping Address", time: "1 week ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.item}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
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
