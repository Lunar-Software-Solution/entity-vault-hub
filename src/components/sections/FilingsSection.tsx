import { useState, useMemo, useCallback } from "react";
import { Plus, Calendar, List, CheckSquare, Search, Filter, Square, SquareCheck, SquarePen, SquareX, PlaySquare, Trash2, Mail, Loader2, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  useEntityFilings, 
  useFilingTasks, 
  useFilingTypes, 
  useEntities,
  EntityFiling,
  FilingTask
} from "@/hooks/usePortalData";
import { 
  useCreateEntityFiling, 
  useUpdateEntityFiling, 
  useDeleteEntityFiling,
  useCreateFilingTask,
  useUpdateFilingTask,
  useDeleteFilingTask,
  useCompleteTask,
  useMarkFilingFiled,
  useBulkDeleteTasks,
  useBulkUpdateTaskStatus
} from "@/hooks/usePortalMutations";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import EntityFilingForm from "@/components/forms/EntityFilingForm";
import FilingTaskForm from "@/components/forms/FilingTaskForm";
import FilingsCalendar from "@/components/filings/FilingsCalendar";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ColumnMultiFilter, { FilterOption } from "@/components/shared/ColumnMultiFilter";
import BulkActionsToolbar from "@/components/shared/BulkActionsToolbar";
import { format } from "date-fns";
import { 
  getFilingDisplayStatus, 
  STATUS_COLORS, 
  PRIORITY_COLORS,
  FILING_CATEGORY_COLORS,
  formatCurrency,
  formatDueDate,
  getStatusLabel,
  getPriorityLabel
} from "@/lib/filingUtils";

interface FilingsSectionProps {
  entityFilter?: string | null;
}

const FilingsSection = ({ entityFilter }: FilingsSectionProps) => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [showFilingForm, setShowFilingForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingFiling, setEditingFiling] = useState<EntityFiling | null>(null);
  const [editingTask, setEditingTask] = useState<FilingTask | null>(null);
  const [deletingFiling, setDeletingFiling] = useState<EntityFiling | null>(null);
  const [deletingTask, setDeletingTask] = useState<FilingTask | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [preselectedDate, setPreselectedDate] = useState<string>("");
  const [sendingReminders, setSendingReminders] = useState(false);
  const { toast } = useToast();

  // Multi-select column filters for Tasks
  const [taskEntityFilter, setTaskEntityFilter] = useState<string[]>([]);
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string[]>([]);
  const [taskStatusFilter, setTaskStatusFilter] = useState<string[]>([]);
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState<string[]>([]);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

  // Bulk selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Generate recurring tasks state
  const [generatingFor, setGeneratingFor] = useState<EntityFiling | null>(null);
  const [taskCount, setTaskCount] = useState("12");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: filings, isLoading: filingsLoading } = useEntityFilings();
  const { data: tasks, isLoading: tasksLoading } = useFilingTasks();
  const { data: filingTypes, isLoading: typesLoading } = useFilingTypes();
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { canWrite } = useUserRole();

  const createFiling = useCreateEntityFiling();
  const updateFiling = useUpdateEntityFiling();
  const deleteFiling = useDeleteEntityFiling();
  const createTask = useCreateFilingTask();
  const updateTask = useUpdateFilingTask();
  const deleteTask = useDeleteFilingTask();
  const completeTask = useCompleteTask();
  const markFiled = useMarkFilingFiled();
  const bulkDeleteTasks = useBulkDeleteTasks();
  const bulkUpdateTaskStatus = useBulkUpdateTaskStatus();

  const isLoading = filingsLoading || tasksLoading || typesLoading || entitiesLoading;

  // Filter filings by entity and search
  const filteredFilings = useMemo(() => {
    if (!filings) return [];
    return filings.filter(filing => {
      if (entityFilter && filing.entity_id !== entityFilter) return false;
      if (statusFilter !== "all") {
        const displayStatus = getFilingDisplayStatus(filing.due_date, filing.status);
        if (displayStatus !== statusFilter) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const entity = entities?.find(e => e.id === filing.entity_id);
        const type = filingTypes?.find(t => t.id === filing.filing_type_id);
        return (
          filing.title.toLowerCase().includes(query) ||
          entity?.name.toLowerCase().includes(query) ||
          type?.name.toLowerCase().includes(query) ||
          filing.jurisdiction?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [filings, entityFilter, statusFilter, searchQuery, entities, filingTypes]);

  // Filter tasks with advanced multi-select column filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => {
      // Global entity filter from header
      if (entityFilter && task.entity_id !== entityFilter) return false;
      
      // Multi-select entity filter
      if (taskEntityFilter.length > 0 && !taskEntityFilter.includes(task.entity_id)) return false;
      
      // Multi-select priority filter
      if (taskPriorityFilter.length > 0 && !taskPriorityFilter.includes(task.priority)) return false;
      
      // Multi-select status filter
      if (taskStatusFilter.length > 0 && !taskStatusFilter.includes(task.status)) return false;
      
      // Multi-select assignee filter
      if (taskAssigneeFilter.length > 0) {
        const assignee = task.assigned_to || "__unassigned__";
        if (!taskAssigneeFilter.includes(assignee)) return false;
      }
      
      // Text search
      if (taskSearchQuery) {
        const query = taskSearchQuery.toLowerCase();
        const entity = entities?.find(e => e.id === task.entity_id);
        return (
          task.title.toLowerCase().includes(query) ||
          entity?.name.toLowerCase().includes(query) ||
          task.assigned_to?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tasks, entityFilter, taskEntityFilter, taskPriorityFilter, taskStatusFilter, taskAssigneeFilter, taskSearchQuery, entities]);

  // Generate filter options from data
  const taskFilterOptions = useMemo(() => {
    if (!tasks || !entities) return { entities: [], priorities: [], statuses: [], assignees: [] };
    
    const entitySet = new Set<string>();
    const prioritySet = new Set<string>();
    const statusSet = new Set<string>();
    const assigneeSet = new Set<string>();
    
    tasks.forEach(task => {
      entitySet.add(task.entity_id);
      prioritySet.add(task.priority);
      statusSet.add(task.status);
      if (task.assigned_to) {
        assigneeSet.add(task.assigned_to);
      } else {
        assigneeSet.add("__unassigned__");
      }
    });
    
    const priorityOrder = ["urgent", "high", "medium", "low"];
    const statusOrder = ["pending", "in_progress", "completed", "cancelled"];
    
    return {
      entities: Array.from(entitySet).map(id => ({
        value: id,
        label: entities.find(e => e.id === id)?.name || "Unknown"
      })).sort((a, b) => a.label.localeCompare(b.label)),
      priorities: priorityOrder
        .filter(p => prioritySet.has(p))
        .map(p => ({
          value: p,
          label: getPriorityLabel(p),
          color: p === "urgent" ? "bg-red-500" : p === "high" ? "bg-orange-500" : p === "medium" ? "bg-yellow-500" : "bg-green-500"
        })),
      statuses: statusOrder
        .filter(s => statusSet.has(s))
        .map(s => ({
          value: s,
          label: getStatusLabel(s),
          color: s === "pending" ? "bg-blue-500" : s === "in_progress" ? "bg-yellow-500" : s === "completed" ? "bg-green-500" : "bg-zinc-500"
        })),
      assignees: Array.from(assigneeSet).map(a => ({
        value: a,
        label: a === "__unassigned__" ? "Unassigned" : a
      })).sort((a, b) => {
        if (a.value === "__unassigned__") return 1;
        if (b.value === "__unassigned__") return -1;
        return a.label.localeCompare(b.label);
      })
    };
  }, [tasks, entities]);

  const clearAllTaskFilters = useCallback(() => {
    setTaskEntityFilter([]);
    setTaskPriorityFilter([]);
    setTaskStatusFilter([]);
    setTaskAssigneeFilter([]);
    setTaskSearchQuery("");
  }, []);

  const hasActiveTaskFilters = taskEntityFilter.length > 0 || taskPriorityFilter.length > 0 || taskStatusFilter.length > 0 || taskAssigneeFilter.length > 0 || taskSearchQuery !== "";

  // Bulk selection handlers
  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const selectAllFilteredTasks = useCallback(() => {
    setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)));
  }, [filteredTasks]);

  const clearTaskSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedTaskIds);
    await bulkDeleteTasks.mutateAsync(ids);
    setSelectedTaskIds(new Set());
    setShowBulkDeleteConfirm(false);
  }, [selectedTaskIds, bulkDeleteTasks]);

  const handleBulkStatusChange = useCallback(async (status: string) => {
    const ids = Array.from(selectedTaskIds);
    await bulkUpdateTaskStatus.mutateAsync({ ids, status });
    setSelectedTaskIds(new Set());
  }, [selectedTaskIds, bulkUpdateTaskStatus]);

  const isAllFilteredSelected = filteredTasks.length > 0 && filteredTasks.every(t => selectedTaskIds.has(t.id));
  const isSomeSelected = selectedTaskIds.size > 0 && !isAllFilteredSelected;

  const getEntityName = (entityId: string) => {
    return entities?.find(e => e.id === entityId)?.name || "Unknown";
  };

  const getFilingType = (typeId: string | null) => {
    if (!typeId) return null;
    return filingTypes?.find(t => t.id === typeId);
  };

  const handleFilingSubmit = async (data: any) => {
    const payload = {
      ...data,
      filing_type_id: data.filing_type_id || null,
      amount: data.amount || 0,
      filing_date: data.filing_date || null,
      confirmation_number: data.confirmation_number || null,
      filed_by: data.filed_by || null,
      jurisdiction: data.jurisdiction || null,
      notes: data.notes || null,
    };

    if (editingFiling) {
      await updateFiling.mutateAsync({ ...payload, id: editingFiling.id });
    } else {
      await createFiling.mutateAsync(payload);
    }
    setShowFilingForm(false);
    setEditingFiling(null);
    setPreselectedDate("");
  };

  const handleTaskSubmit = async (data: any) => {
    const payload = {
      ...data,
      filing_id: data.filing_id || null,
      description: data.description || null,
      assigned_to: data.assigned_to || null,
    };

    if (editingTask) {
      await updateTask.mutateAsync({ ...payload, id: editingTask.id });
    } else {
      await createTask.mutateAsync(payload);
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleFilingClick = (filing: EntityFiling) => {
    setEditingFiling(filing);
    setShowFilingForm(true);
  };

  const handleAddFilingFromCalendar = (date: Date) => {
    setPreselectedDate(format(date, "yyyy-MM-dd"));
    setShowFilingForm(true);
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-task-reminders', {
        body: { days_ahead: 7 }
      });
      
      if (error) throw error;
      
      toast({
        title: "Reminders sent",
        description: `Successfully sent ${data.emailsSent || 0} reminder email(s) for ${data.tasksFound || 0} task(s).`,
      });
    } catch (error: any) {
      console.error('Error sending reminders:', error);
      toast({
        title: "Failed to send reminders",
        description: error.message || "An error occurred while sending reminder emails.",
        variant: "destructive",
      });
    } finally {
      setSendingReminders(false);
    }
  };

  const handleGenerateTasks = async () => {
    if (!generatingFor) return;
    
    const count = parseInt(taskCount, 10);
    if (isNaN(count) || count < 1 || count > 24) {
      toast({
        title: "Invalid count",
        description: "Please enter a number between 1 and 24",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("generate-recurring-tasks", {
        body: { filingId: generatingFor.id, count },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate tasks");
      }

      toast({
        title: "Tasks generated",
        description: response.data.message || `Created ${response.data.tasksCreated} tasks`,
      });
      setGeneratingFor(null);
      setTaskCount("12");
    } catch (error) {
      console.error("Error generating tasks:", error);
      toast({
        title: "Failed to generate tasks",
        description: error instanceof Error ? error.message : "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const upcomingCount = filteredFilings.filter(f => 
    getFilingDisplayStatus(f.due_date, f.status) === "pending"
  ).length;
  const overdueCount = filteredFilings.filter(f => 
    getFilingDisplayStatus(f.due_date, f.status) === "overdue"
  ).length;
  const filedCount = filteredFilings.filter(f => f.status === "filed").length;
  const openTasksCount = filteredTasks.filter(t => 
    t.status === "pending" || t.status === "in_progress"
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Filings & Tasks</h2>
          <p className="text-muted-foreground">Manage regulatory filings and deadlines</p>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="text-foreground" 
              onClick={handleSendReminders}
              disabled={sendingReminders}
            >
              {sendingReminders ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Send Reminders
            </Button>
            <Button variant="outline" className="text-foreground" onClick={() => setShowTaskForm(true)}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button onClick={() => setShowFilingForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Filing
            </Button>
          </div>
        )}
      </div>

      {/* Stats - Clickable to filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          className={`glass-card rounded-xl p-4 text-left transition-all hover:ring-2 hover:ring-blue-400/50 ${
            activeTab === "list" && statusFilter === "pending" ? "ring-2 ring-blue-400" : ""
          }`}
          onClick={() => {
            setActiveTab("list");
            setStatusFilter("pending");
          }}
        >
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold text-blue-400">{upcomingCount}</p>
        </button>
        <button 
          className={`glass-card rounded-xl p-4 text-left transition-all hover:ring-2 hover:ring-red-400/50 ${
            activeTab === "list" && statusFilter === "overdue" ? "ring-2 ring-red-400" : ""
          }`}
          onClick={() => {
            setActiveTab("list");
            setStatusFilter("overdue");
          }}
        >
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
        </button>
        <button 
          className={`glass-card rounded-xl p-4 text-left transition-all hover:ring-2 hover:ring-green-400/50 ${
            activeTab === "list" && statusFilter === "filed" ? "ring-2 ring-green-400" : ""
          }`}
          onClick={() => {
            setActiveTab("list");
            setStatusFilter("filed");
          }}
        >
          <p className="text-sm text-muted-foreground">Filed</p>
          <p className="text-2xl font-bold text-green-400">{filedCount}</p>
        </button>
        <button 
          className={`glass-card rounded-xl p-4 text-left transition-all hover:ring-2 hover:ring-yellow-400/50 ${
            activeTab === "tasks" && (taskStatusFilter.includes("pending") || taskStatusFilter.includes("in_progress")) ? "ring-2 ring-yellow-400" : ""
          }`}
          onClick={() => {
            setActiveTab("tasks");
            setTaskStatusFilter(["pending", "in_progress"]);
          }}
        >
          <p className="text-sm text-muted-foreground">Open Tasks</p>
          <p className="text-2xl font-bold text-yellow-400">{openTasksCount}</p>
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              Filings
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
                {activeTab === "tasks" && (
                  <>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-0">
          <FilingsCalendar
            filings={filteredFilings}
            entities={entities || []}
            filingTypes={filingTypes || []}
            onFilingClick={handleFilingClick}
            onAddFiling={handleAddFilingFromCalendar}
          />
        </TabsContent>

        {/* Filings List Tab */}
        <TabsContent value="list" className="mt-0">
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filing</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFilings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No filings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFilings.map(filing => {
                    const displayStatus = getFilingDisplayStatus(filing.due_date, filing.status);
                    const filingType = getFilingType(filing.filing_type_id);

                    return (
                      <TableRow key={filing.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {filingType && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${FILING_CATEGORY_COLORS[filingType.category] || FILING_CATEGORY_COLORS.Other}`}
                              >
                                {filingType.code}
                              </Badge>
                            )}
                            <div>
                              <p className="font-medium text-foreground">{filing.title}</p>
                              {filing.jurisdiction && (
                                <p className="text-xs text-muted-foreground">{filing.jurisdiction}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{getEntityName(filing.entity_id)}</TableCell>
                        <TableCell>
                          <span className={displayStatus === "overdue" ? "text-red-400" : "text-foreground"}>
                            {formatDueDate(filing.due_date)}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground">{formatCurrency(Number(filing.amount))}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_COLORS[displayStatus]}>
                            {getStatusLabel(displayStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {canWrite && filing.frequency !== "one-time" && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => setGeneratingFor(filing)}
                                title="Generate recurring tasks"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            {canWrite && (
                              filing.status === "filed" ? (
                                <div className="h-8 w-8 flex items-center justify-center text-green-500">
                                  <SquareCheck className="h-4 w-4" />
                                </div>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-green-500"
                                  onClick={() => markFiled.mutate({ id: filing.id })}
                                  title="Mark Filed"
                                >
                                  <Square className="h-4 w-4" />
                                </Button>
                              )
                            )}
                            {canWrite && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary"
                                onClick={() => handleFilingClick(filing)}
                                title="Edit"
                              >
                                <SquarePen className="h-4 w-4" />
                              </Button>
                            )}
                            {canWrite && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeletingFiling(filing)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-0">
          {/* Task Filters Bar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {hasActiveTaskFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllTaskFilters}
                className="text-muted-foreground hover:text-foreground gap-1"
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
            <div className="text-sm text-muted-foreground ml-auto">
              {filteredTasks.length} of {tasks?.length || 0} tasks
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {canWrite && (
            <BulkActionsToolbar
              selectedCount={selectedTaskIds.size}
              totalCount={filteredTasks.length}
              onSelectAll={selectAllFilteredTasks}
              onClearSelection={clearTaskSelection}
              onBulkDelete={() => setShowBulkDeleteConfirm(true)}
              onBulkStatusChange={handleBulkStatusChange}
              isDeleting={bulkDeleteTasks.isPending}
              isUpdating={bulkUpdateTaskStatus.isPending}
            />
          )}

          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {canWrite && (
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllFilteredSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAllFilteredTasks();
                          } else {
                            clearTaskSelection();
                          }
                        }}
                        aria-label="Select all"
                        className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                        {...(isSomeSelected ? { "data-state": "indeterminate" as const } : {})}
                      />
                    </TableHead>
                  )}
                  <TableHead className="text-foreground">Task</TableHead>
                  <TableHead className="p-0">
                    <ColumnMultiFilter
                      title="Entity"
                      options={taskFilterOptions.entities}
                      selectedValues={taskEntityFilter}
                      onSelectionChange={setTaskEntityFilter}
                    />
                  </TableHead>
                  <TableHead className="text-foreground">Due Date</TableHead>
                  <TableHead className="p-0">
                    <ColumnMultiFilter
                      title="Priority"
                      options={taskFilterOptions.priorities}
                      selectedValues={taskPriorityFilter}
                      onSelectionChange={setTaskPriorityFilter}
                    />
                  </TableHead>
                  <TableHead className="p-0">
                    <ColumnMultiFilter
                      title="Status"
                      options={taskFilterOptions.statuses}
                      selectedValues={taskStatusFilter}
                      onSelectionChange={setTaskStatusFilter}
                    />
                  </TableHead>
                  <TableHead className="p-0">
                    <ColumnMultiFilter
                      title="Assigned To"
                      options={taskFilterOptions.assignees}
                      selectedValues={taskAssigneeFilter}
                      onSelectionChange={setTaskAssigneeFilter}
                    />
                  </TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canWrite ? 8 : 7} className="text-center py-8 text-muted-foreground">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map(task => (
                    <TableRow 
                      key={task.id} 
                      className={`${task.status === "cancelled" ? "opacity-50" : ""} ${selectedTaskIds.has(task.id) ? "bg-primary/5" : ""}`}
                    >
                      {canWrite && (
                        <TableCell>
                          <Checkbox
                            checked={selectedTaskIds.has(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            aria-label={`Select ${task.title}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-foreground">
                        <div>
                          <p className={`font-medium ${task.status === "cancelled" ? "line-through" : ""}`}>
                            {task.title}
                          </p>
                          {task.is_auto_generated && (
                            <Badge variant="secondary" className="text-xs mt-1">Auto</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{getEntityName(task.entity_id)}</TableCell>
                      <TableCell>{format(new Date(task.due_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={PRIORITY_COLORS[task.priority]}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[task.status]}>
                          {getStatusLabel(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">{task.assigned_to || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {canWrite && (
                            task.status === "completed" ? (
                              <div className="h-8 w-8 flex items-center justify-center text-green-500" title="Completed">
                                <SquareCheck className="h-4 w-4" />
                              </div>
                            ) : task.status === "cancelled" ? (
                              <div className="h-8 w-8 flex items-center justify-center text-zinc-500" title="Cancelled">
                                <SquareX className="h-4 w-4" />
                              </div>
                            ) : task.status === "in_progress" ? (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-yellow-500 hover:text-green-500"
                                onClick={() => completeTask.mutate(task.id)}
                                title="In Progress - Click to Complete"
                              >
                                <PlaySquare className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-green-500"
                                onClick={() => completeTask.mutate(task.id)}
                                title="Pending - Click to Complete"
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            )
                          )}
                          {canWrite && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-primary hover:text-primary"
                              onClick={() => {
                                setEditingTask(task);
                                setShowTaskForm(true);
                              }}
                              title="Edit"
                            >
                              <SquarePen className="h-4 w-4" />
                            </Button>
                          )}
                          {canWrite && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeletingTask(task)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Filing Form Dialog */}
      <Dialog open={showFilingForm} onOpenChange={(open) => {
        setShowFilingForm(open);
        if (!open) {
          setEditingFiling(null);
          setPreselectedDate("");
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFiling ? "Edit Filing" : "Add Filing"}</DialogTitle>
          </DialogHeader>
          <EntityFilingForm
            defaultValues={editingFiling ? {
              entity_id: editingFiling.entity_id,
              filing_type_id: editingFiling.filing_type_id || "",
              title: editingFiling.title,
              jurisdiction: editingFiling.jurisdiction || "",
              due_date: editingFiling.due_date,
              filing_date: editingFiling.filing_date || "",
              frequency: editingFiling.frequency,
              amount: Number(editingFiling.amount),
              confirmation_number: editingFiling.confirmation_number || "",
              filed_by: editingFiling.filed_by || "",
              notes: editingFiling.notes || "",
              status: editingFiling.status as "pending" | "filed" | "overdue",
              reminder_days: editingFiling.reminder_days,
            } : preselectedDate ? { due_date: preselectedDate } : undefined}
            onSubmit={handleFilingSubmit}
            onCancel={() => {
              setShowFilingForm(false);
              setEditingFiling(null);
              setPreselectedDate("");
            }}
            isLoading={createFiling.isPending || updateFiling.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={(open) => {
        setShowTaskForm(open);
        if (!open) setEditingTask(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
          </DialogHeader>
          <FilingTaskForm
            defaultValues={editingTask ? {
              entity_id: editingTask.entity_id,
              filing_id: editingTask.filing_id || "",
              title: editingTask.title,
              description: editingTask.description || "",
              due_date: editingTask.due_date,
              priority: editingTask.priority as "low" | "medium" | "high" | "urgent",
              status: editingTask.status as "pending" | "in_progress" | "completed" | "cancelled",
              assigned_to: editingTask.assigned_to || "",
            } : undefined}
            onSubmit={handleTaskSubmit}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
            isLoading={createTask.isPending || updateTask.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Filing Confirm */}
      <DeleteConfirmDialog
        open={!!deletingFiling}
        onOpenChange={(open) => !open && setDeletingFiling(null)}
        onConfirm={() => {
          if (deletingFiling) {
            deleteFiling.mutate(deletingFiling.id);
            setDeletingFiling(null);
          }
        }}
        title="Delete Filing"
        description={`Are you sure you want to delete "${deletingFiling?.title}"? This action cannot be undone.`}
      />

      {/* Delete Task Confirm */}
      <DeleteConfirmDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        onConfirm={() => {
          if (deletingTask) {
            deleteTask.mutate(deletingTask.id);
            setDeletingTask(null);
          }
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
      />

      {/* Bulk Delete Tasks Confirm */}
      <DeleteConfirmDialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        onConfirm={handleBulkDelete}
        title="Delete Selected Tasks"
        description={`Are you sure you want to delete ${selectedTaskIds.size} selected task(s)? This action cannot be undone.`}
      />

      {/* Generate Recurring Tasks Dialog */}
      <Dialog open={!!generatingFor} onOpenChange={(open) => {
        if (!open) {
          setGeneratingFor(null);
          setTaskCount("12");
        }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Generate Recurring Tasks</DialogTitle>
            <DialogDescription>
              Create upcoming tasks for "{generatingFor?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="taskCount">How many tasks to create?</Label>
            <Input
              id="taskCount"
              type="number"
              min="1"
              max="24"
              value={taskCount}
              onChange={(e) => setTaskCount(e.target.value)}
              placeholder="12"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter a number between 1 and 24. Tasks will be created based on the filing's frequency ({generatingFor?.frequency}).
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGeneratingFor(null);
                setTaskCount("12");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateTasks} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Tasks"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilingsSection;
