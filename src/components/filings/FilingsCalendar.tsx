import { useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  setMonth,
  setYear
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EntityFiling, Entity } from "@/hooks/usePortalData";
import { getFilingDisplayStatus, STATUS_COLORS, FILING_CATEGORY_COLORS } from "@/lib/filingUtils";
import CalendarDayPopover from "./CalendarDayPopover";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generate years from 2020 to 2035
const YEARS = Array.from({ length: 16 }, (_, i) => 2020 + i);

interface FilingsCalendarProps {
  filings: EntityFiling[];
  entities: Entity[];
  filingTypes: { id: string; name: string; code: string; category: string }[];
  onFilingClick?: (filing: EntityFiling) => void;
  onAddFiling?: (date: Date) => void;
}

const FilingsCalendar = ({ 
  filings, 
  entities, 
  filingTypes,
  onFilingClick,
  onAddFiling
}: FilingsCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Get all days to display (including days from previous/next months to fill the grid)
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Group filings by date
  const filingsByDate = useMemo(() => {
    const map = new Map<string, EntityFiling[]>();
    filings.forEach(filing => {
      const dateKey = filing.due_date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(filing);
    });
    return map;
  }, [filings]);

  const getFilingsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return filingsByDate.get(dateKey) || [];
  };

  const getEntityName = (entityId: string) => {
    return entities.find(e => e.id === entityId)?.name || "Unknown";
  };

  const getFilingType = (typeId: string | null) => {
    if (!typeId) return null;
    return filingTypes.find(t => t.id === typeId);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => 
      direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleMonthChange = (monthIndex: string) => {
    setCurrentMonth(prev => setMonth(prev, parseInt(monthIndex)));
  };

  const handleYearChange = (year: string) => {
    setCurrentMonth(prev => setYear(prev, parseInt(year)));
  };

  return (
    <div className="glass-card rounded-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="text-foreground hover:text-primary">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[130px] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[90px] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="text-foreground hover:text-primary">
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={goToToday} className="text-foreground ml-2">
            Today
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(day => {
          const dayFilings = getFilingsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const hasFilings = dayFilings.length > 0;

          // Count by status for display
          const pendingCount = dayFilings.filter(f => getFilingDisplayStatus(f.due_date, f.status) === "pending").length;
          const filedCount = dayFilings.filter(f => f.status === "filed").length;
          const overdueCount = dayFilings.filter(f => getFilingDisplayStatus(f.due_date, f.status) === "overdue").length;

          return (
            <CalendarDayPopover
              key={day.toISOString()}
              day={day}
              filings={dayFilings}
              entities={entities}
              filingTypes={filingTypes}
              onFilingClick={onFilingClick}
              onAddFiling={onAddFiling}
              trigger={
                <button
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "min-h-[80px] p-2 rounded-lg border transition-all duration-200 text-left",
                    isCurrentMonth 
                      ? "bg-card border-border hover:border-primary/50" 
                      : "bg-muted/30 border-transparent text-muted-foreground",
                    isToday(day) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isSelected && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-sm font-medium",
                      isToday(day) && "text-primary"
                    )}>
                      {format(day, "d")}
                    </span>
                    {hasFilings && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {dayFilings.length}
                      </Badge>
                    )}
                  </div>

                  {/* Filing indicators */}
                  {hasFilings && (
                    <div className="mt-1 space-y-0.5">
                      {overdueCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs text-red-400">{overdueCount} overdue</span>
                        </div>
                      )}
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-xs text-blue-400">{pendingCount} pending</span>
                        </div>
                      )}
                      {filedCount > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs text-green-400">{filedCount} filed</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              }
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Filed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">Overdue</span>
        </div>
      </div>
    </div>
  );
};

export default FilingsCalendar;
