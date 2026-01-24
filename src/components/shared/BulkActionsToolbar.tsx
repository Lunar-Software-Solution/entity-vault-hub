import { X, Trash2, CheckCircle, Clock, XCircle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
  statusOptions?: { value: string; label: string }[];
}

const BulkActionsToolbar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  isDeleting = false,
  isUpdating = false,
  statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ],
}: BulkActionsToolbarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
        {selectedCount < totalCount && (
          <Button
            variant="link"
            size="sm"
            onClick={onSelectAll}
            className="text-xs p-0 h-auto"
          >
            Select all {totalCount}
          </Button>
        )}
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Select onValueChange={onBulkStatusChange} disabled={isUpdating}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Change status..." />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.value === "pending" && <Square className="h-3 w-3" />}
                  {option.value === "in_progress" && <Clock className="h-3 w-3 text-yellow-500" />}
                  {option.value === "completed" && <CheckCircle className="h-3 w-3 text-green-500" />}
                  {option.value === "cancelled" && <XCircle className="h-3 w-3 text-zinc-500" />}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={isDeleting}
          className="h-8"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="ml-auto h-8"
      >
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
  );
};

export default BulkActionsToolbar;
