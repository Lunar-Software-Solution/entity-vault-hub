import { useState } from "react";
import { FileCheck, Plus, MoreVertical, Pencil, Trash2, Linkedin, Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { RegistrationAgent } from "@/hooks/usePortalData";
import { useCreateRegistrationAgent, useUpdateRegistrationAgent, useDeleteRegistrationAgent } from "@/hooks/usePortalMutations";
import RegistrationAgentForm from "@/components/forms/RegistrationAgentForm";
import type { RegistrationAgentFormData } from "@/lib/formSchemas";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

interface LinkedRegistrationAgentsProps {
  agents: RegistrationAgent[];
  entityId: string;
}

const LinkedRegistrationAgents = ({ agents, entityId }: LinkedRegistrationAgentsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<RegistrationAgent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<RegistrationAgent | null>(null);

  const createMutation = useCreateRegistrationAgent();
  const updateMutation = useUpdateRegistrationAgent();
  const deleteMutation = useDeleteRegistrationAgent();

  const handleSubmit = (data: RegistrationAgentFormData) => {
    const payload = {
      ...data,
      engagement_start_date: data.engagement_start_date || null,
      engagement_end_date: data.engagement_end_date || null,
      contact_name: data.contact_name || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      linkedin_url: data.linkedin_url || null,
      address: data.address || null,
      agent_type: data.agent_type || null,
      fee_structure: data.fee_structure || null,
      notes: data.notes || null,
    };

    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, ...payload }, {
        onSuccess: () => handleCloseForm(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => handleCloseForm(),
      });
    }
  };

  const handleEdit = (agent: RegistrationAgent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingAgent) {
      deleteMutation.mutate(deletingAgent.id, {
        onSuccess: () => setDeletingAgent(null),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAgent(null);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Registration Agents</h3>
          <Badge variant="secondary">{agents.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {agents.length === 0 ? (
        <p className="text-muted-foreground text-sm">No registration agents linked.</p>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{agent.name}</h4>
                    <Badge variant={agent.is_active ? "default" : "secondary"}>
                      {agent.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {agent.agent_type && (
                    <p className="text-sm text-muted-foreground">{agent.agent_type}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(agent)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingAgent(agent)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {agent.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{agent.email}</span>
                  </div>
                )}
                {agent.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{agent.phone}</span>
                  </div>
                )}
                {agent.linkedin_url && (
                  <a
                    href={agent.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>View LinkedIn</span>
                  </a>
                )}
                {(agent.engagement_start_date || agent.engagement_end_date) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {agent.engagement_start_date && format(new Date(agent.engagement_start_date), "MMM yyyy")}
                      {agent.engagement_start_date && " - "}
                      {agent.engagement_end_date ? format(new Date(agent.engagement_end_date), "MMM yyyy") : "Present"}
                    </span>
                  </div>
                )}
              </div>

              {agent.jurisdictions_covered && agent.jurisdictions_covered.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {agent.jurisdictions_covered.map((jur) => (
                    <Badge key={jur} variant="outline" className="text-xs">
                      {jur}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAgent ? "Edit" : "Add"} Registration Agent</DialogTitle>
          </DialogHeader>
          <RegistrationAgentForm
            agent={editingAgent ?? undefined}
            entityId={entityId}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingAgent}
        onOpenChange={(open) => !open && setDeletingAgent(null)}
        onConfirm={handleDelete}
        title="Delete Registration Agent"
        description={`Are you sure you want to delete "${deletingAgent?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedRegistrationAgents;
