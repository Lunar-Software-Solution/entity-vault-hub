import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  useLawFirms, useAccountantFirms, useAuditors, useAdvisors, useConsultants, useRegistrationAgents, useEntities,
  type LawFirm, type AccountantFirm, type Auditor, type Advisor, type Consultant, type RegistrationAgent
} from "@/hooks/usePortalData";
import {
  useCreateLawFirm, useUpdateLawFirm, useDeleteLawFirm,
  useCreateAccountantFirm, useUpdateAccountantFirm, useDeleteAccountantFirm,
  useCreateAuditor, useUpdateAuditor, useDeleteAuditor,
  useCreateAdvisor, useUpdateAdvisor, useDeleteAdvisor,
  useCreateConsultant, useUpdateConsultant, useDeleteConsultant,
  useCreateRegistrationAgent, useUpdateRegistrationAgent, useDeleteRegistrationAgent,
} from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import CompanyLogo from "@/components/shared/CompanyLogo";
import LawFirmForm from "@/components/forms/LawFirmForm";
import AccountantFirmForm from "@/components/forms/AccountantFirmForm";
import AuditorForm from "@/components/forms/AuditorForm";
import AdvisorForm from "@/components/forms/AdvisorForm";
import ConsultantForm from "@/components/forms/ConsultantForm";
import RegistrationAgentForm from "@/components/forms/RegistrationAgentForm";
import { Plus, Edit, Trash2, Search, Scale, Calculator, ClipboardCheck, Lightbulb, Briefcase, UserCheck, ExternalLink } from "lucide-react";

type ProviderType = "law_firms" | "accountants" | "auditors" | "advisors" | "consultants" | "registration_agents";

const ServiceProvidersSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProviderType>("law_firms");
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form/dialog state
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);

  // Data hooks
  const { data: lawFirms, isLoading: lawFirmsLoading } = useLawFirms();
  const { data: accountants, isLoading: accountantsLoading } = useAccountantFirms();
  const { data: auditors, isLoading: auditorsLoading } = useAuditors();
  const { data: advisors, isLoading: advisorsLoading } = useAdvisors();
  const { data: consultants, isLoading: consultantsLoading } = useConsultants();
  const { data: registrationAgents, isLoading: regAgentsLoading } = useRegistrationAgents();
  const { data: entities } = useEntities();

  // Mutations
  const createLawFirm = useCreateLawFirm();
  const updateLawFirm = useUpdateLawFirm();
  const deleteLawFirm = useDeleteLawFirm();

  const createAccountant = useCreateAccountantFirm();
  const updateAccountant = useUpdateAccountantFirm();
  const deleteAccountant = useDeleteAccountantFirm();

  const createAuditor = useCreateAuditor();
  const updateAuditor = useUpdateAuditor();
  const deleteAuditor = useDeleteAuditor();

  const createAdvisor = useCreateAdvisor();
  const updateAdvisor = useUpdateAdvisor();
  const deleteAdvisor = useDeleteAdvisor();

  const createConsultant = useCreateConsultant();
  const updateConsultant = useUpdateConsultant();
  const deleteConsultant = useDeleteConsultant();

  const createRegAgent = useCreateRegistrationAgent();
  const updateRegAgent = useUpdateRegistrationAgent();
  const deleteRegAgent = useDeleteRegistrationAgent();

  const isLoading = lawFirmsLoading || accountantsLoading || auditorsLoading || advisorsLoading || consultantsLoading || regAgentsLoading;

  // Get entity name by ID
  const getEntityName = (entityId: string) => {
    return entities?.find(e => e.id === entityId)?.name || "Unknown Entity";
  };

  // Get current data based on active tab
  const getCurrentData = (): any[] => {
    switch (activeTab) {
      case "law_firms": return lawFirms || [];
      case "accountants": return accountants || [];
      case "auditors": return auditors || [];
      case "advisors": return advisors || [];
      case "consultants": return consultants || [];
      case "registration_agents": return registrationAgents || [];
      default: return [];
    }
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let data = getCurrentData();

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter((item: any) =>
        item.name?.toLowerCase().includes(query) ||
        item.contact_name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query)
      );
    }

    // Apply entity filter
    if (entityFilter !== "all") {
      data = data.filter((item: any) => item.entity_id === entityFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      data = data.filter((item: any) => item.is_active === isActive);
    }

    return data;
  }, [activeTab, lawFirms, accountants, auditors, advisors, consultants, registrationAgents, searchQuery, entityFilter, statusFilter]);

  // Handle form submit - clean empty strings to null for date fields
  const handleSubmit = (data: any) => {
    // Common fields across all provider types
    const baseCleanData = {
      name: data.name,
      entity_id: data.entity_id,
      contact_name: data.contact_name || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      linkedin_url: data.linkedin_url || null,
      address: data.address || null,
      engagement_start_date: data.engagement_start_date || null,
      engagement_end_date: data.engagement_end_date || null,
      fee_structure: data.fee_structure || null,
      notes: data.notes || null,
      is_active: data.is_active ?? true,
    };

    // Type-specific field mappings
    const typeSpecificFields: Record<ProviderType, Record<string, any>> = {
      law_firms: {
        bar_number: data.bar_number || null,
        practice_areas: data.practice_areas || [],
      },
      accountants: {
        license_number: data.license_number || null,
        specializations: data.specializations || [],
      },
      auditors: {
        license_number: data.license_number || null,
        audit_types: data.audit_types || [],
        certifications: data.certifications || [],
      },
      advisors: {
        advisor_type: data.advisor_type || null,
        certifications: data.certifications || [],
      },
      consultants: {
        consultant_type: data.consultant_type || null,
        project_scope: data.project_scope || null,
      },
      registration_agents: {
        agent_type: data.agent_type || null,
        jurisdictions_covered: data.jurisdictions_covered || [],
      },
    };

    const cleanData = { ...baseCleanData, ...typeSpecificFields[activeTab] };

    const mutations = {
      law_firms: { create: createLawFirm, update: updateLawFirm },
      accountants: { create: createAccountant, update: updateAccountant },
      auditors: { create: createAuditor, update: updateAuditor },
      advisors: { create: createAdvisor, update: updateAdvisor },
      consultants: { create: createConsultant, update: updateConsultant },
      registration_agents: { create: createRegAgent, update: updateRegAgent },
    };

    const mutation = mutations[activeTab];
    if (editingItem) {
      mutation.update.mutate({ id: editingItem.id, ...cleanData }, {
        onSuccess: () => { setShowForm(false); setEditingItem(null); }
      });
    } else {
      mutation.create.mutate(cleanData, {
        onSuccess: () => setShowForm(false)
      });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!deletingItem) return;
    
    const deleteMutations = {
      law_firms: deleteLawFirm,
      accountants: deleteAccountant,
      auditors: deleteAuditor,
      advisors: deleteAdvisor,
      consultants: deleteConsultant,
      registration_agents: deleteRegAgent,
    };

    deleteMutations[activeTab].mutate(deletingItem.id, {
      onSuccess: () => setDeletingItem(null)
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const renderForm = () => {
    const commonProps = {
      onSubmit: handleSubmit,
      onCancel: handleCloseForm,
      isLoading: false,
      entityId: editingItem?.entity_id || "",
    };

    switch (activeTab) {
      case "law_firms": 
        return <LawFirmForm {...commonProps} firm={editingItem} />;
      case "accountants": 
        return <AccountantFirmForm {...commonProps} firm={editingItem} />;
      case "auditors": 
        return <AuditorForm {...commonProps} auditor={editingItem} />;
      case "advisors": 
        return <AdvisorForm {...commonProps} advisor={editingItem} />;
      case "consultants": 
        return <ConsultantForm {...commonProps} consultant={editingItem} />;
      case "registration_agents": 
        return <RegistrationAgentForm {...commonProps} agent={editingItem} />;
      default: 
        return null;
    }
  };

  const tabConfig = [
    { id: "law_firms" as const, label: "Law Firms", icon: Scale, count: lawFirms?.length || 0 },
    { id: "accountants" as const, label: "Accountants", icon: Calculator, count: accountants?.length || 0 },
    { id: "auditors" as const, label: "Auditors", icon: ClipboardCheck, count: auditors?.length || 0 },
    { id: "advisors" as const, label: "Advisors", icon: Lightbulb, count: advisors?.length || 0 },
    { id: "consultants" as const, label: "Consultants", icon: Briefcase, count: consultants?.length || 0 },
    { id: "registration_agents" as const, label: "Reg. Agents", icon: UserCheck, count: registrationAgents?.length || 0 },
  ];

  const getFormTitle = () => {
    const titles = {
      law_firms: editingItem ? "Edit Law Firm" : "Add Law Firm",
      accountants: editingItem ? "Edit Accountant Firm" : "Add Accountant Firm",
      auditors: editingItem ? "Edit Auditor" : "Add Auditor",
      advisors: editingItem ? "Edit Advisor" : "Add Advisor",
      consultants: editingItem ? "Edit Consultant" : "Add Consultant",
      registration_agents: editingItem ? "Edit Registration Agent" : "Add Registration Agent",
    };
    return titles[activeTab];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Service Providers</h2>
        <p className="text-muted-foreground">Manage all service providers across your entities</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProviderType)} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          {tabConfig.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2 py-3">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 glass-card rounded-xl p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, contact, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="Filter by Entity" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">All Entities</SelectItem>
                {entities?.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowForm(true)} className="gap-2 ml-auto">
              <Plus className="w-4 h-4" />
              Add Provider
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Contact</TableHead>
                  <TableHead className="text-foreground">Entity</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CompanyLogo 
                          domain={item.website} 
                          name={item.name} 
                          size="sm"
                        />
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.contact_name || "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary hover:underline"
                        onClick={() => navigate(`/entity/${item.entity_id}`)}
                      >
                        {getEntityName(item.entity_id)}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.email || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingItem(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredData.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {searchQuery || entityFilter !== "all" || statusFilter !== "all"
                        ? "No providers match your filters"
                        : "No providers added yet"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>{getFormTitle()}</DialogTitle>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Provider"
        description={`Are you sure you want to delete "${deletingItem?.name || "this provider"}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ServiceProvidersSection;
