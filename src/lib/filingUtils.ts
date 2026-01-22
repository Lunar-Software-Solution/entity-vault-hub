import { differenceInDays, format, isAfter, isBefore, isToday, startOfDay } from "date-fns";

// Category colors
export const FILING_CATEGORY_COLORS: Record<string, string> = {
  State: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Federal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Tax: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Corporate: "bg-green-500/20 text-green-400 border-green-500/30",
  Payroll: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  Other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

// Priority colors
export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
};

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  filed: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30 line-through",
};

// Frequency options
export const FREQUENCY_OPTIONS = [
  { value: "one-time", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
];

// Filing status options
export const FILING_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "filed", label: "Filed" },
  { value: "overdue", label: "Overdue" },
];

// Task status options
export const TASK_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// Task priority options
export const TASK_PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

// Category options
export const FILING_CATEGORY_OPTIONS = [
  { value: "State", label: "State" },
  { value: "Federal", label: "Federal" },
  { value: "Tax", label: "Tax" },
  { value: "Corporate", label: "Corporate" },
  { value: "Payroll", label: "Payroll" },
  { value: "Other", label: "Other" },
];

// Get display status - adjusts for overdue dynamically
export function getFilingDisplayStatus(dueDate: string, currentStatus: string): string {
  if (currentStatus === "filed") return "filed";
  
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  
  if (isBefore(due, today)) {
    return "overdue";
  }
  
  return currentStatus;
}

// Calculate days until due
export function getDaysUntilDue(dueDate: string): number {
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  return differenceInDays(due, today);
}

// Get priority based on days remaining
export function calculatePriority(dueDate: string): "low" | "medium" | "high" | "urgent" {
  const days = getDaysUntilDue(dueDate);
  
  if (days <= 7) return "urgent";
  if (days <= 14) return "high";
  if (days <= 30) return "medium";
  return "low";
}

// Format due date with relative indicator
export function formatDueDate(dueDate: string): string {
  const days = getDaysUntilDue(dueDate);
  const formatted = format(new Date(dueDate), "MMM d, yyyy");
  
  if (isToday(new Date(dueDate))) {
    return `${formatted} (Today)`;
  }
  if (days === 1) {
    return `${formatted} (Tomorrow)`;
  }
  if (days < 0) {
    return `${formatted} (${Math.abs(days)} days overdue)`;
  }
  if (days <= 7) {
    return `${formatted} (${days} days)`;
  }
  
  return formatted;
}

// Format currency
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Get status display label
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    filed: "Filed",
    completed: "Completed",
    overdue: "Overdue",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

// Get priority display label
export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };
  return labels[priority] || priority;
}

// Check if a date is in a given month
export function isInMonth(date: Date, month: Date): boolean {
  return (
    date.getMonth() === month.getMonth() &&
    date.getFullYear() === month.getFullYear()
  );
}
