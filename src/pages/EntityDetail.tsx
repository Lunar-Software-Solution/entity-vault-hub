import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  useEntities, 
  useBankAccounts, 
  useCreditCards, 
  useAddresses, 
  useContracts,
  usePhoneNumbers,
  useTaxIds,
  useAccountantFirms,
  useLawFirms,
  useRegistrationAgents,
  useAdvisors,
  useConsultants,
  useAuditors,
  useEntityDocuments,
  useFilingsForEntity,
  useTasksForEntity,
  useSocialMediaAccounts,
  useEmailAddresses
} from "@/hooks/usePortalData";
import { useUpdateEntity } from "@/hooks/usePortalMutations";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  Wallet,
  CreditCard,
  FileText,
  ExternalLink,
  Receipt,
  Calculator,
  Scale,
  FileCheck,
  Lightbulb,
  Briefcase,
  ClipboardCheck,
  FolderOpen,
  CheckSquare,
  Share2,
  Users,
  Pencil
} from "lucide-react";
import { format } from "date-fns";
import CompanyLogo from "@/components/shared/CompanyLogo";
import EntityForm from "@/components/forms/EntityForm";
import LinkedBankAccounts from "@/components/entity-detail/LinkedBankAccounts";
import LinkedCreditCards from "@/components/entity-detail/LinkedCreditCards";
import LinkedAddresses from "@/components/entity-detail/LinkedAddresses";
import LinkedContracts from "@/components/entity-detail/LinkedContracts";
import LinkedPhoneNumbers from "@/components/entity-detail/LinkedPhoneNumbers";
import LinkedTaxIds from "@/components/entity-detail/LinkedTaxIds";
import LinkedAccountantFirms from "@/components/entity-detail/LinkedAccountantFirms";
import LinkedLawFirms from "@/components/entity-detail/LinkedLawFirms";
import LinkedRegistrationAgents from "@/components/entity-detail/LinkedRegistrationAgents";
import LinkedAdvisors from "@/components/entity-detail/LinkedAdvisors";
import LinkedConsultants from "@/components/entity-detail/LinkedConsultants";
import LinkedAuditors from "@/components/entity-detail/LinkedAuditors";
import LinkedDocuments from "@/components/entity-detail/LinkedDocuments";
import LinkedFilings from "@/components/entity-detail/LinkedFilings";
import LinkedFilingTasks from "@/components/entity-detail/LinkedFilingTasks";
import LinkedSocialMedia from "@/components/entity-detail/LinkedSocialMedia";
import LinkedDirectorsUbos from "@/components/entity-detail/LinkedDirectorsUbos";
import type { EntityFormData } from "@/lib/formSchemas";

const useDirectorsUbosForEntity = (entityId: string) => {
  return useQuery({
    queryKey: ["directors_ubos", entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directors_ubos")
        .select("*")
        .eq("entity_id", entityId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!entityId,
  });
};

const EntityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { canWrite } = useUserRole();
  const updateEntity = useUpdateEntity();
  
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { data: bankAccounts, isLoading: bankLoading } = useBankAccounts();
  const { data: creditCards, isLoading: cardsLoading } = useCreditCards();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: contracts, isLoading: contractsLoading } = useContracts();
  const { data: phoneNumbers, isLoading: phonesLoading } = usePhoneNumbers();
  const { data: taxIds, isLoading: taxIdsLoading } = useTaxIds();
  const { data: accountantFirms, isLoading: accountantsLoading } = useAccountantFirms();
  const { data: lawFirms, isLoading: lawFirmsLoading } = useLawFirms();
  const { data: registrationAgents, isLoading: agentsLoading } = useRegistrationAgents();
  const { data: advisors, isLoading: advisorsLoading } = useAdvisors();
  const { data: consultants, isLoading: consultantsLoading } = useConsultants();
  const { data: auditors, isLoading: auditorsLoading } = useAuditors();
  const { data: entityDocuments, isLoading: docsLoading } = useEntityDocuments();
  const { data: filings, isLoading: filingsLoading } = useFilingsForEntity(id || "");
  const { data: tasks, isLoading: tasksLoading } = useTasksForEntity(id || "");
  const { data: socialMediaAccounts, isLoading: socialLoading } = useSocialMediaAccounts();
  const { data: directorsUbos, isLoading: directorsLoading } = useDirectorsUbosForEntity(id || "");
  const { data: emailAddresses, isLoading: emailsLoading } = useEmailAddresses();

  const entity = entities?.find(e => e.id === id);
  const linkedBankAccounts = bankAccounts?.filter(b => b.entity_id === id) ?? [];
  const linkedCreditCards = creditCards?.filter(c => c.entity_id === id) ?? [];
  const linkedAddresses = addresses?.filter(a => a.entity_id === id) ?? [];
  const linkedContracts = contracts?.filter(c => c.entity_id === id) ?? [];
  const linkedPhoneNumbers = phoneNumbers?.filter(p => p.entity_id === id) ?? [];
  const linkedTaxIds = taxIds?.filter(t => t.entity_id === id) ?? [];
  const linkedAccountantFirms = accountantFirms?.filter(f => f.entity_id === id) ?? [];
  const linkedLawFirms = lawFirms?.filter(f => f.entity_id === id) ?? [];
  const linkedRegistrationAgents = registrationAgents?.filter(a => a.entity_id === id) ?? [];
  const linkedAdvisors = advisors?.filter(a => a.entity_id === id) ?? [];
  const linkedConsultants = consultants?.filter(c => c.entity_id === id) ?? [];
  const linkedAuditors = auditors?.filter(a => a.entity_id === id) ?? [];
  const linkedDocuments = entityDocuments?.filter(d => d.entity_id === id) ?? [];
  const linkedSocialMedia = socialMediaAccounts?.filter(s => s.entity_id === id) ?? [];
  const linkedDirectorsUbos = directorsUbos ?? [];
  const linkedEmails = emailAddresses?.filter(e => e.entity_id === id) ?? [];

  const isLoading = entitiesLoading || bankLoading || cardsLoading || addressesLoading || 
    contractsLoading || phonesLoading || taxIdsLoading || accountantsLoading || 
    lawFirmsLoading || agentsLoading || advisorsLoading || consultantsLoading || auditorsLoading || docsLoading || filingsLoading || tasksLoading || socialLoading || directorsLoading || emailsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-48 w-full rounded-xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </Button>
        <div className="glass-card rounded-xl p-12 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Entity not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-8 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Portal
      </Button>

      {/* Entity Header */}
      <div className="glass-card rounded-xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <CompanyLogo 
            domain={entity.website} 
            name={entity.name} 
            size="lg"
            className="w-20 h-20 rounded-2xl"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{entity.name}</h1>
            <p className="text-muted-foreground text-lg">{entity.type}</p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge variant={entity.status === "Active" ? "default" : "secondary"}>
                {entity.status}
              </Badge>
            </div>
          </div>
          {canWrite && (
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)} className="gap-2">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

        {/* Entity Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Founded</span>
            </div>
            <p className="text-foreground font-medium">
              {entity.founded_date 
                ? format(new Date(entity.founded_date), "MMM d, yyyy")
                : "Not specified"}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Jurisdiction</span>
            </div>
            <p className="text-foreground font-medium">{entity.jurisdiction || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* Primary Items & Social Media */}
      {(linkedAddresses.some(a => a.is_primary) || 
        linkedPhoneNumbers.some(p => p.is_primary) || 
        linkedTaxIds.some(t => t.is_primary) || 
        linkedEmails.some(e => e.is_primary) ||
        linkedBankAccounts.some(b => b.is_primary) ||
        linkedDirectorsUbos.some(d => d.is_primary) ||
        linkedSocialMedia.length > 0) && (
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Email */}
            {linkedEmails.filter(e => e.is_primary).map(email => (
              <div key={email.id} className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Primary Email</span>
                </div>
                <p className="text-sm text-foreground">{email.email}</p>
                <p className="text-xs text-muted-foreground">{email.label}</p>
              </div>
            ))}

            {/* Primary Phone */}
            {linkedPhoneNumbers.filter(p => p.is_primary).map(phone => (
              <div key={phone.id} className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Primary Phone</span>
                </div>
                <p className="text-sm text-foreground font-mono">
                  {phone.country_code} {phone.phone_number}
                </p>
                <p className="text-xs text-muted-foreground">{phone.label}</p>
              </div>
            ))}

            {/* Primary Address */}
            {linkedAddresses.filter(a => a.is_primary).map(address => (
              <div key={address.id} className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Primary Address</span>
                </div>
                <p className="text-sm text-foreground">{address.street}</p>
                <p className="text-sm text-foreground">{address.city}, {address.state} {address.zip}</p>
                <p className="text-sm text-muted-foreground">{address.country}</p>
              </div>
            ))}

            {/* Primary Tax ID */}
            {linkedTaxIds.filter(t => t.is_primary).map(taxId => (
              <div key={taxId.id} className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Receipt className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Primary Tax ID</span>
                </div>
                <p className="text-sm text-foreground font-mono">{taxId.tax_id_number}</p>
                <p className="text-xs text-muted-foreground">{taxId.type} — {taxId.country}</p>
              </div>
            ))}

            {/* Primary Bank Account */}
            {linkedBankAccounts.filter(b => b.is_primary).map(account => (
              <div key={account.id} className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Primary Bank</span>
                </div>
                <p className="text-sm text-foreground">{account.bank}</p>
                <p className="text-sm text-foreground font-mono">••••{account.account_number.slice(-4)}</p>
              </div>
            ))}

            {/* Primary Director/Contact */}
            {linkedDirectorsUbos.filter(d => d.is_primary).map(director => (
              <div key={director.id} className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Primary Contact</span>
                </div>
                <p className="text-sm text-foreground">{director.name}</p>
                <p className="text-xs text-muted-foreground">{director.title || director.role_type}</p>
              </div>
            ))}

            {/* Social Media */}
            {linkedSocialMedia.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Social Media</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {linkedSocialMedia.map(social => (
                    <a
                      key={social.id}
                      href={social.profile_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-80 ${social.color || 'bg-zinc-800'}`}
                    >
                      {social.avatar_url ? (
                        <img src={social.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                      ) : null}
                      <span>{social.platform}</span>
                      {social.is_verified && (
                        <span className="text-[10px]">✓</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Summary - Row 1: Core Data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedBankAccounts.length}</p>
          <p className="text-sm text-muted-foreground">Bank Accounts</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <CreditCard className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedCreditCards.length}</p>
          <p className="text-sm text-muted-foreground">Credit Cards</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Phone className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedPhoneNumbers.length}</p>
          <p className="text-sm text-muted-foreground">Phone Numbers</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Receipt className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedTaxIds.length}</p>
          <p className="text-sm text-muted-foreground">Tax IDs</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedAddresses.length}</p>
          <p className="text-sm text-muted-foreground">Addresses</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <FolderOpen className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedDocuments.length}</p>
          <p className="text-sm text-muted-foreground">Documents</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedContracts.length}</p>
          <p className="text-sm text-muted-foreground">Contracts</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{filings?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Filings</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <CheckSquare className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{tasks?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Tasks</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Share2 className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedSocialMedia.length}</p>
          <p className="text-sm text-muted-foreground">Social Media</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedDirectorsUbos.length}</p>
          <p className="text-sm text-muted-foreground">Directors/UBOs</p>
        </div>
      </div>

      {/* Stats Summary - Row 2: Service Providers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4 text-center">
          <Calculator className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedAccountantFirms.length}</p>
          <p className="text-sm text-muted-foreground">Accountants</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Scale className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedLawFirms.length}</p>
          <p className="text-sm text-muted-foreground">Law Firms</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <FileCheck className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedRegistrationAgents.length}</p>
          <p className="text-sm text-muted-foreground">Reg. Agents</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Lightbulb className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedAdvisors.length}</p>
          <p className="text-sm text-muted-foreground">Advisors</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Briefcase className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedConsultants.length}</p>
          <p className="text-sm text-muted-foreground">Consultants</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <ClipboardCheck className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedAuditors.length}</p>
          <p className="text-sm text-muted-foreground">Auditors</p>
        </div>
      </div>

      {/* Linked Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LinkedBankAccounts accounts={linkedBankAccounts} />
        <LinkedCreditCards cards={linkedCreditCards} />
        <LinkedDirectorsUbos directorsUbos={linkedDirectorsUbos} entityId={id!} />
        <LinkedPhoneNumbers phones={linkedPhoneNumbers} entityId={id!} />
        <LinkedTaxIds taxIds={linkedTaxIds} entityId={id!} />
        <LinkedAddresses addresses={linkedAddresses} />
        <LinkedDocuments documents={linkedDocuments} entityId={id!} />
        <LinkedContracts contracts={linkedContracts} />
        <LinkedSocialMedia accounts={linkedSocialMedia} entityId={id!} />
        <LinkedFilings entityId={id!} />
        <LinkedFilingTasks entityId={id!} />
        <LinkedAccountantFirms firms={linkedAccountantFirms} entityId={id!} />
        <LinkedLawFirms firms={linkedLawFirms} entityId={id!} />
        <LinkedRegistrationAgents agents={linkedRegistrationAgents} entityId={id!} />
        <LinkedAdvisors advisors={linkedAdvisors} entityId={id!} />
        <LinkedConsultants consultants={linkedConsultants} entityId={id!} />
        <LinkedAuditors auditors={linkedAuditors} entityId={id!} />
      </div>

      {/* Edit Entity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Entity</DialogTitle>
          </DialogHeader>
          <EntityForm
            entity={entity}
            onSubmit={(data: EntityFormData) => {
              const cleanedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                  key,
                  value === "" ? null : value,
                ])
              );
              updateEntity.mutate(
                { id: entity.id, ...cleanedData },
                { onSuccess: () => setIsEditDialogOpen(false) }
              );
            }}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={updateEntity.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntityDetail;
