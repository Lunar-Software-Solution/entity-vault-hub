import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EntityFiling, Entity } from "@/hooks/usePortalData";
import { 
  getFilingDisplayStatus, 
  STATUS_COLORS, 
  FILING_CATEGORY_COLORS,
  formatCurrency,
  getStatusLabel
} from "@/lib/filingUtils";

interface CalendarDayPopoverProps {
  day: Date;
  filings: EntityFiling[];
  entities: Entity[];
  filingTypes: { id: string; name: string; code: string; category: string }[];
  onFilingClick?: (filing: EntityFiling) => void;
  onAddFiling?: (date: Date) => void;
  trigger: React.ReactNode;
}

const CalendarDayPopover = ({
  day,
  filings,
  entities,
  filingTypes,
  onFilingClick,
  onAddFiling,
  trigger
}: CalendarDayPopoverProps) => {
  if (filings.length === 0 && !onAddFiling) {
    return <>{trigger}</>;
  }

  const getEntityName = (entityId: string) => {
    return entities.find(e => e.id === entityId)?.name || "Unknown Entity";
  };

  const getFilingType = (typeId: string | null) => {
    if (!typeId) return null;
    return filingTypes.find(t => t.id === typeId);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-foreground">
            {format(day, "MMMM d, yyyy")}
          </h4>
          <p className="text-sm text-muted-foreground">
            {filings.length} filing{filings.length !== 1 ? "s" : ""} due
          </p>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filings.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No filings due on this date
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filings.map(filing => {
                const displayStatus = getFilingDisplayStatus(filing.due_date, filing.status, filing.frequency);
                const filingType = getFilingType(filing.filing_type_id);

                return (
                  <button
                    key={filing.id}
                    onClick={() => onFilingClick?.(filing)}
                    className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {filingType && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${FILING_CATEGORY_COLORS[filingType.category] || FILING_CATEGORY_COLORS.Other}`}
                            >
                              {filingType.code}
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${STATUS_COLORS[displayStatus]}`}
                          >
                            {getStatusLabel(displayStatus)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {filing.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getEntityName(filing.entity_id)}
                        </p>
                        {filing.amount && Number(filing.amount) > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(Number(filing.amount))}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {onAddFiling && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => onAddFiling(day)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add filing for this date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CalendarDayPopover;
