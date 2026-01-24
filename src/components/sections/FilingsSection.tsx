import { useState, useMemo } from "react";
import { Plus, Calendar, List, CheckSquare, Search, Filter, Square, SquareCheck, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  useMarkFilingFiled
} from "@/hooks/usePortalMutations";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import EntityFilingForm from "@/components/forms/EntityFilingForm";
import FilingTaskForm from "@/components/forms/FilingTaskForm";
import FilingsCalendar from "@/components/filings/FilingsCalendar";
import { useUserRole } from "@/hooks/useUserRole";
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

  // Filter tasks by entity and search
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => {
      if (entityFilter && task.entity_id !== entityFilter) return false;
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const entity = entities?.find(e => e.id === task.entity_id);
        return (
          task.title.toLowerCase().includes(query) ||
          entity?.name.toLowerCase().includes(query) ||
          task.assigned_to?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tasks, entityFilter, statusFilter, searchQuery, entities]);

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

  // Stats
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-2xl font-bold text-blue-400">{upcomingCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Filed</p>
          <p className="text-2xl font-bold text-green-400">{filedCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Open Tasks</p>
          <p className="text-2xl font-bold text-yellow-400">{openTasksCount}</p>
        </div>
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
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map(task => (
                    <TableRow key={task.id} className={task.status === "cancelled" ? "opacity-50" : ""}>
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
                              <div className="h-8 w-8 flex items-center justify-center text-green-500">
                                <SquareCheck className="h-4 w-4" />
                              </div>
                            ) : task.status === "cancelled" ? null : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-green-500"
                                onClick={() => completeTask.mutate(task.id)}
                                title="Complete"
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
    </div>
  );
};

export default FilingsSection;
