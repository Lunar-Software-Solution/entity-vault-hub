import { useState } from "react";
import { Plus, Calendar, Edit2, Trash2, Check, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface LinkedFilingsProps {
  entityId: string;
}

const LinkedFilings = ({ entityId }: LinkedFilingsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EntityFiling | null>(null);
  const [deleting, setDeleting] = useState<EntityFiling | null>(null);

  const { data: filings, isLoading } = useFilingsForEntity(entityId);
  const { data: filingTypes } = useFilingTypes();

  const createFiling = useCreateEntityFiling();
  const updateFiling = useUpdateEntityFiling();
  const deleteFiling = useDeleteEntityFiling();
  const markFiled = useMarkFilingFiled();

  const getFilingType = (typeId: string | null) => {
    if (!typeId) return null;
    return filingTypes?.find(t => t.id === typeId);
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
            const displayStatus = getFilingDisplayStatus(filing.due_date, filing.status);
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
    </div>
  );
};

export default LinkedFilings;
