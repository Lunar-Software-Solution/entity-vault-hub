import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, User, Crown, MoreVertical, Mail, Phone, Calendar, Percent, AlertTriangle, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import GravatarAvatar from "@/components/shared/GravatarAvatar";
import DirectorUboForm, { DirectorUboFormData } from "@/components/forms/DirectorUboForm";

interface DirectorUbo {
  id: string;
  entity_id: string;
  name: string;
  role_type: string;
  title: string | null;
  nationality: string | null;
  country_of_residence: string | null;
  date_of_birth: string | null;
  appointment_date: string | null;
  resignation_date: string | null;
  ownership_percentage: number | null;
  control_type: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  id_document_type: string | null;
  id_document_number: string | null;
  id_expiry_date: string | null;
  is_pep: boolean;
  pep_details: string | null;
  is_active: boolean;
  notes: string | null;
  avatar_url: string | null;
  suppress_avatar: boolean;
}

interface LinkedDirectorsUbosProps {
  directorsUbos: DirectorUbo[];
  entityId: string;
  entityName?: string;
}

const LinkedDirectorsUbos = ({ directorsUbos, entityId, entityName }: LinkedDirectorsUbosProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<DirectorUbo | null>(null);
  const [deletingItem, setDeletingItem] = useState<DirectorUbo | null>(null);
  
  const queryClient = useQueryClient();

  const saveIdDocuments = async (directorId: string, idDocuments: any[]) => {
    // Delete existing documents first
    await supabase
      .from("director_id_documents")
      .delete()
      .eq("director_id", directorId);

    // Insert new documents
    if (idDocuments && idDocuments.length > 0) {
      const docsToInsert = idDocuments
        .filter((doc: any) => doc.document_type)
        .map((doc: any) => ({
          director_id: directorId,
          document_type: doc.document_type,
          document_number: doc.document_number || null,
          expiry_date: doc.expiry_date || null,
          file_path: doc.file_path || null,
          file_name: doc.file_name || null,
          notes: doc.notes || null,
        }));

      if (docsToInsert.length > 0) {
        const { error } = await supabase
          .from("director_id_documents")
          .insert(docsToInsert);
        if (error) console.error("Error saving ID documents:", error);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { _id_documents, ...directorData } = data;
      const { data: result, error } = await supabase
        .from("directors_ubos")
        .insert(directorData)
        .select()
        .single();
      if (error) throw error;
      
      if (_id_documents) {
        await saveIdDocuments(result.id, _id_documents);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directors_ubos"] });
      toast.success("Director/UBO added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { _id_documents, ...directorData } = data;
      const { data: result, error } = await supabase
        .from("directors_ubos")
        .update(directorData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      
      if (_id_documents) {
        await saveIdDocuments(id, _id_documents);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directors_ubos"] });
      toast.success("Director/UBO updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("directors_ubos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directors_ubos"] });
      toast.success("Director/UBO deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleSubmit = (data: DirectorUboFormData) => {
    const { id_documents, ...rest } = data;
    const payload = {
      ...rest,
      entity_id: entityId,
      ownership_percentage: data.ownership_percentage ? parseFloat(data.ownership_percentage) : null,
      date_of_birth: data.date_of_birth || null,
      appointment_date: data.appointment_date || null,
      resignation_date: data.resignation_date || null,
      email: data.email || null,
      title: data.title || null,
      nationality: data.nationality || null,
      country_of_residence: data.country_of_residence || null,
      control_type: data.control_type || null,
      address: data.address || null,
      phone: data.phone || null,
      pep_details: data.pep_details || null,
      notes: data.notes || null,
      _id_documents: id_documents, // Pass separately for processing
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
    handleCloseForm();
  };

  const handleEdit = (item: DirectorUbo) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id);
      setDeletingItem(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const getRoleBadge = (roleType: string) => {
    switch (roleType) {
      case "director":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Director</Badge>;
      case "ubo":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">UBO</Badge>;
      case "both":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">Director & UBO</Badge>;
      default:
        return null;
    }
  };

  const directors = directorsUbos.filter(d => d.role_type === "director" || d.role_type === "both");
  const ubos = directorsUbos.filter(d => d.role_type === "ubo" || d.role_type === "both");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Directors & UBOs
          <Badge variant="secondary" className="ml-2">{directorsUbos.length}</Badge>
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {directorsUbos.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          <User className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No directors or UBOs linked</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {directorsUbos.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <GravatarAvatar
                    email={item.email}
                    name={item.name}
                    size="md"
                    linkedinUrl={item.linkedin_url}
                    storedAvatarUrl={item.avatar_url}
                    recordId={item.id}
                    tableName="directors_ubos"
                    suppressAvatar={item.suppress_avatar}
                    enableEnrichment={false}
                    fallbackIcon={
                      item.role_type === "ubo" ? (
                        <Crown className="w-5 h-5 text-purple-400" />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )
                    }
                  />
                  <div>
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      {item.name}
                      {item.is_pep && (
                        <span title="PEP">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.title || "No title"}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(item)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingItem(item)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {getRoleBadge(item.role_type)}
                {!item.is_active && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    Inactive
                  </Badge>
                )}
              </div>

              <div className="space-y-1 text-sm">
                {item.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{item.email}</span>
                  </div>
                )}
                {item.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{item.phone}</span>
                  </div>
                )}
                {item.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <a
                      href={item.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#0A66C2] hover:underline"
                    >
                      <Linkedin className="w-3 h-3" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                )}
                {item.appointment_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Appointed: {new Date(item.appointment_date).toLocaleDateString()}</span>
                  </div>
                )}
                {item.ownership_percentage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Percent className="w-3 h-3" />
                    <span>{item.ownership_percentage}% ownership</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Director/UBO</DialogTitle>
          </DialogHeader>
          <DirectorUboForm
            item={editingItem}
            entityId={entityId}
            entityName={entityName}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Director/UBO"
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default LinkedDirectorsUbos;
