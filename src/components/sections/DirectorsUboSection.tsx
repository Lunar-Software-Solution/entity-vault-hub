import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Building2, User, Users, Crown, MoreVertical, Mail, Phone, Calendar, Percent, Shield, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEntities } from "@/hooks/usePortalData";
import { useUserRole } from "@/hooks/useUserRole";
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
  tax_id: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  passport_number: string | null;
  id_document_type: string | null;
  id_document_number: string | null;
  id_expiry_date: string | null;
  is_pep: boolean;
  pep_details: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const useDirectorsUbos = () => {
  return useQuery({
    queryKey: ["directors_ubos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directors_ubos")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as DirectorUbo[];
    },
  });
};

const saveIdDocuments = async (directorId: string, idDocuments: any[]) => {
  // Delete existing documents first
  await supabase
    .from("director_id_documents")
    .delete()
    .eq("director_id", directorId);

  // Insert new documents
  if (idDocuments && idDocuments.length > 0) {
    const docsToInsert = idDocuments
      .filter((doc) => doc.document_type) // Only save docs with a type
      .map((doc) => ({
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

const useCreateDirectorUbo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { _id_documents, ...directorData } = data;
      const { data: result, error } = await supabase
        .from("directors_ubos")
        .insert(directorData)
        .select()
        .single();
      if (error) throw error;
      
      // Save ID documents
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
};

const useUpdateDirectorUbo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { _id_documents, ...directorData } = data;
      const { data: result, error } = await supabase
        .from("directors_ubos")
        .update(directorData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      
      // Save ID documents
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
};

const useDeleteDirectorUbo = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
};

interface DirectorsUboSectionProps {
  entityFilter?: string | null;
}

const DirectorsUboSection = ({ entityFilter }: DirectorsUboSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(entityFilter || null);
  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<DirectorUbo | null>(null);
  const [deletingItem, setDeletingItem] = useState<DirectorUbo | null>(null);

  const { data: directorsUbos = [], isLoading } = useDirectorsUbos();
  const { data: entities = [] } = useEntities();
  const { canWrite } = useUserRole();
  const createMutation = useCreateDirectorUbo();
  const updateMutation = useUpdateDirectorUbo();
  const deleteMutation = useDeleteDirectorUbo();

  const filteredData = useMemo(() => {
    return directorsUbos.filter((item) => {
      // Entity filter
      if (selectedEntityId && item.entity_id !== selectedEntityId) return false;
      
      // Tab filter
      if (activeTab === "directors" && item.role_type !== "director" && item.role_type !== "both") return false;
      if (activeTab === "ubos" && item.role_type !== "ubo" && item.role_type !== "both") return false;
      if (activeTab === "pep" && !item.is_pep) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.title?.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query) ||
          item.nationality?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [directorsUbos, selectedEntityId, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const filtered = selectedEntityId 
      ? directorsUbos.filter(d => d.entity_id === selectedEntityId)
      : directorsUbos;
    
    return {
      total: filtered.length,
      directors: filtered.filter(d => d.role_type === "director" || d.role_type === "both").length,
      ubos: filtered.filter(d => d.role_type === "ubo" || d.role_type === "both").length,
      peps: filtered.filter(d => d.is_pep).length,
      active: filtered.filter(d => d.is_active).length,
    };
  }, [directorsUbos, selectedEntityId]);

  const getEntityName = (entityId: string) => {
    return entities.find((e) => e.id === entityId)?.name || "Unknown Entity";
  };

  const handleSubmit = (data: DirectorUboFormData) => {
    const { id_documents, ...rest } = data;
    const payload = {
      ...rest,
      entity_id: selectedEntityId || entities[0]?.id,
      ownership_percentage: data.ownership_percentage ? parseFloat(data.ownership_percentage) : null,
      date_of_birth: data.date_of_birth || null,
      appointment_date: data.appointment_date || null,
      resignation_date: data.resignation_date || null,
      email: data.email || null,
      title: data.title || null,
      nationality: data.nationality || null,
      country_of_residence: data.country_of_residence || null,
      control_type: data.control_type || null,
      tax_id: data.tax_id || null,
      address: data.address || null,
      phone: data.phone || null,
      passport_number: data.passport_number || null,
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

  const getControlTypeBadge = (controlType: string | null) => {
    if (!controlType) return null;
    const labels: Record<string, string> = {
      direct: "Direct",
      indirect: "Indirect",
      voting_rights: "Voting Rights",
      other: "Other",
    };
    return <Badge variant="secondary" className="text-xs">{labels[controlType] || controlType}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Directors & UBOs</h1>
          <p className="text-muted-foreground mt-1">
            Manage directors and ultimate beneficial owners
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Director/UBO
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.directors}</p>
              <p className="text-xs text-muted-foreground">Directors</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Crown className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.ubos}</p>
              <p className="text-xs text-muted-foreground">UBOs</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.peps}</p>
              <p className="text-xs text-muted-foreground">PEPs</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, title, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedEntityId || "all"} onValueChange={(v) => setSelectedEntityId(v === "all" ? null : v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="directors">Directors ({stats.directors})</TabsTrigger>
          <TabsTrigger value="ubos">UBOs ({stats.ubos})</TabsTrigger>
          <TabsTrigger value="pep">PEPs ({stats.peps})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No records found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search criteria" : "Add your first director or UBO"}
              </p>
              {canWrite && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Director/UBO
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <GravatarAvatar
                        email={item.email}
                        name={item.name}
                        size="md"
                        fallbackIcon={
                          item.role_type === "ubo" ? (
                            <Crown className="w-5 h-5 text-purple-400" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )
                        }
                      />
                      <div>
                        <h3 className="font-medium text-foreground flex items-center gap-2">
                          {item.name}
                          {item.is_pep && (
                            <span title="Politically Exposed Person">
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.title || "No title"}</p>
                      </div>
                    </div>
                    {canWrite && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingItem(item)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {getRoleBadge(item.role_type)}
                    {!item.is_active && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                        Inactive
                      </Badge>
                    )}
                    {getControlTypeBadge(item.control_type)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{getEntityName(item.entity_id)}</span>
                    </div>
                    
                    {item.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{item.email}</span>
                      </div>
                    )}
                    
                    {item.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{item.phone}</span>
                      </div>
                    )}

                    {item.appointment_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Appointed: {new Date(item.appointment_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    {item.ownership_percentage && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Percent className="w-4 h-4" />
                        <span>{item.ownership_percentage}% ownership</span>
                      </div>
                    )}

                    {item.nationality && (
                      <p className="text-muted-foreground">
                        Nationality: {item.nationality}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Director/UBO</DialogTitle>
          </DialogHeader>
          <DirectorUboForm
            item={editingItem}
            entityId={selectedEntityId || entities[0]?.id || ""}
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

export default DirectorsUboSection;
