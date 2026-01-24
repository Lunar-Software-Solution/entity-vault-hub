import { useState } from "react";
import { Plus, Calendar, Edit2, Trash2, Check, DollarSign, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntityFiling, useFilingsForEntity, useFilingTypes } from "@/hooks/usePortalData";
import { useCreateEntityFiling, useUpdateEntityFiling, useDeleteEntityFiling, useMarkFilingFiled } from "@/hooks/usePortalMutations";
import EntityFilingForm from "@/components/forms/EntityFilingForm";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { format } from "date-fns";
import { 
  getFilingDisplayStatus, 
  STATUS_COLORS, 
  FILING_CATEGORY_COLORS, 
  formatCurrency,
  formatDueDate,
  getStatusLabel
} from "@/lib/filingUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LinkedFilingsProps {
  entityId: string;
}

const LinkedFilings = ({ entityId }: LinkedFilingsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EntityFiling | null>(null);
  const [deleting, setDeleting] = useState<EntityFiling | null>(null);
  const [generatingFor, setGeneratingFor] = useState<EntityFiling | null>(null);
  const [taskCount, setTaskCount] = useState("12");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: filings, isLoading, refetch } = useFilingsForEntity(entityId);
  const { data: filingTypes } = useFilingTypes();

  const createFiling = useCreateEntityFiling();
  const updateFiling = useUpdateEntityFiling();
  const deleteFiling = useDeleteEntityFiling();
  const markFiled = useMarkFilingFiled();

  const getFilingType = (typeId: string | null) => {
    if (!typeId) return null;
    return filingTypes?.find(t => t.id === typeId);
  };

  const handleGenerateTasks = async () => {
    if (!generatingFor) return;
    
    const count = parseInt(taskCount, 10);
    if (isNaN(count) || count < 1 || count > 24) {
      toast.error("Please enter a number between 1 and 24");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-recurring-tasks", {
        body: { filingId: generatingFor.id, count },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate tasks");
      }

      toast.success(response.data.message || `Created ${response.data.tasksCreated} tasks`);
      setGeneratingFor(null);
      setTaskCount("12");
      refetch();
    } catch (error) {
      console.error("Error generating tasks:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate tasks");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (data: any) => {
    const payload = {
      ...data,
      entity_id: entityId,
      filing_type_id: data.filing_type_id || null,
      amount: data.amount || 0,
      filing_date: data.filing_date || null,
      confirmation_number: data.confirmation_number || null,
      filed_by: data.filed_by || null,
      jurisdiction: data.jurisdiction || null,
      notes: data.notes || null,
    };

    if (editing) {
      await updateFiling.mutateAsync({ ...payload, id: editing.id });
    } else {
      await createFiling.mutateAsync(payload);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filings</h3>
          <Badge variant="secondary">{filings?.length || 0}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : filings?.length === 0 ? (
        <p className="text-muted-foreground text-sm">No filings recorded yet.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filings?.map(filing => {
            const displayStatus = getFilingDisplayStatus(filing.due_date, filing.status, filing.frequency);
            const filingType = getFilingType(filing.filing_type_id);

            return (
              <div 
                key={filing.id} 
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {filingType && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${FILING_CATEGORY_COLORS[filingType.category] || FILING_CATEGORY_COLORS.Other}`}
                        >
                          {filingType.code}
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${STATUS_COLORS[displayStatus]}`}>
                        {getStatusLabel(displayStatus)}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground truncate">{filing.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDueDate(filing.due_date)}
                      </span>
                      {filing.amount && Number(filing.amount) > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(Number(filing.amount))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {filing.frequency !== "one-time" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setGeneratingFor(filing)}
                        title="Generate recurring tasks"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    )}
                    {filing.status !== "filed" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => markFiled.mutate({ id: filing.id })}
                        title="Mark as filed"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditing(filing);
                        setShowForm(true);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(filing)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) setEditing(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Filing" : "Add Filing"}</DialogTitle>
          </DialogHeader>
          <EntityFilingForm
            preselectedEntityId={entityId}
            defaultValues={editing ? {
              entity_id: editing.entity_id,
              filing_type_id: editing.filing_type_id || "",
              title: editing.title,
              jurisdiction: editing.jurisdiction || "",
              due_date: editing.due_date,
              filing_date: editing.filing_date || "",
              frequency: editing.frequency,
              amount: Number(editing.amount),
              confirmation_number: editing.confirmation_number || "",
              filed_by: editing.filed_by || "",
              notes: editing.notes || "",
              status: editing.status as "pending" | "filed" | "overdue",
              reminder_days: editing.reminder_days,
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            isLoading={createFiling.isPending || updateFiling.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteFiling.mutate(deleting.id);
            setDeleting(null);
          }
        }}
        title="Delete Filing"
        description={`Are you sure you want to delete "${deleting?.title}"?`}
      />

      {/* Generate Tasks Dialog */}
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

export default LinkedFilings;
