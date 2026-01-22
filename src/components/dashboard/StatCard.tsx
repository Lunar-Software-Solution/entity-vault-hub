import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
  onClick?: () => void;
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = "default",
  onClick
}: StatCardProps) => {
  return (
    <div 
      className={cn(
        "glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}% from last month
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          variant === "primary" && "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
          variant === "success" && "bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground",
          variant === "warning" && "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground",
          variant === "default" && "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
