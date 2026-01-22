import { useState } from "react";
import { Plus, CheckSquare, Edit2, Trash2, Check, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FilingTask, useTasksForEntity } from "@/hooks/usePortalData";
import { useCreateFilingTask, useUpdateFilingTask, useDeleteFilingTask, useCompleteTask } from "@/hooks/usePortalMutations";
import FilingTaskForm from "@/components/forms/FilingTaskForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { format } from "date-fns";
import { 
  STATUS_COLORS, 
  PRIORITY_COLORS, 
  getStatusLabel,
  getPriorityLabel
} from "@/lib/filingUtils";

interface LinkedFilingTasksProps {
  entityId: string;
}

const LinkedFilingTasks = ({ entityId }: LinkedFilingTasksProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FilingTask | null>(null);
  const [deleting, setDeleting] = useState<FilingTask | null>(null);

  const { data: tasks, isLoading } = useTasksForEntity(entityId);

  const createTask = useCreateFilingTask();
  const updateTask = useUpdateFilingTask();
  const deleteTask = useDeleteFilingTask();
  const completeTask = useCompleteTask();

  const handleSubmit = async (data: any) => {
    const payload = {
      ...data,
      entity_id: entityId,
      filing_id: data.filing_id || null,
      description: data.description || null,
      assigned_to: data.assigned_to || null,
    };

    if (editing) {
      await updateTask.mutateAsync({ ...payload, id: editing.id });
    } else {
      await createTask.mutateAsync(payload);
    }
    setShowForm(false);
    setEditing(null);
  };

  // Filter to show only active tasks first
  const sortedTasks = tasks?.slice().sort((a, b) => {
    // Completed/cancelled at the end
    const statusOrder = { pending: 0, in_progress: 1, completed: 2, cancelled: 3 };
    const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 2;
    const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 2;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // Then by due date
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Tasks</h3>
          <Badge variant="secondary">{tasks?.length || 0}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : tasks?.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tasks yet.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {sortedTasks?.map(task => (
            <div 
              key={task.id} 
              className={`p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors ${
                task.status === "cancelled" ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[task.status]}`}>
                      {getStatusLabel(task.status)}
                    </Badge>
                    {task.is_auto_generated && (
                      <Badge variant="secondary" className="text-xs">Auto</Badge>
                    )}
                  </div>
                  <p className={`font-medium text-foreground truncate ${
                    task.status === "cancelled" ? "line-through" : ""
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                    </span>
                    {task.assigned_to && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assigned_to}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {task.status !== "completed" && task.status !== "cancelled" && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => completeTask.mutate(task.id)}
                      title="Mark as complete"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditing(task);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleting(task)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditing(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Task" : "Add Task"}</DialogTitle>
          </DialogHeader>
          <FilingTaskForm
            preselectedEntityId={entityId}
            defaultValues={editing ? {
              entity_id: editing.entity_id,
              filing_id: editing.filing_id || "",
              title: editing.title,
              description: editing.description || "",
              due_date: editing.due_date,
              priority: editing.priority as "low" | "medium" | "high" | "urgent",
              status: editing.status as "pending" | "in_progress" | "completed" | "cancelled",
              assigned_to: editing.assigned_to || "",
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            isLoading={createTask.isPending || updateTask.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteTask.mutate(deleting.id);
            setDeleting(null);
          }
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleting?.title}"?`}
      />
    </div>
  );
};

export default LinkedFilingTasks;
