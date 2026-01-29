import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  useEntities, 
  useBankAccounts, 
  useCreditCards, 
  useAddresses,
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
  useEmailAddresses,
  useEntityWebsites,
  useEntitySoftware
} from "@/hooks/usePortalData";
import { useUpdateEntity, useDeleteEntity } from "@/hooks/usePortalMutations";
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
  Pencil,
  Trash2,
  FileText as DescriptionIcon
} from "lucide-react";
import { format } from "date-fns";
import CompanyLogo from "@/components/shared/CompanyLogo";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
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
import LinkedWebsites from "@/components/entity-detail/LinkedWebsites";
import LinkedSoftware from "@/components/entity-detail/LinkedSoftware";
import LinkedEmailAddresses from "@/components/entity-detail/LinkedEmailAddresses";
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

// Fetch contracts linked to this entity via junction table
const useContractsForEntity = (entityId: string) => {
  return useQuery({
    queryKey: ["contracts-for-entity", entityId],
    queryFn: async () => {
      // Get contract IDs from the links table
      const { data: links, error: linksError } = await supabase
        .from("contract_entity_links")
        .select("contract_id")
        .eq("entity_id", entityId);
      
      if (linksError) throw linksError;
      
      const contractIds = links?.map(l => l.contract_id) || [];
      
      // Also get contracts with legacy entity_id
      const { data: legacyContracts, error: legacyError } = await supabase
        .from("contracts")
        .select("*")
        .eq("entity_id", entityId);
      
      if (legacyError) throw legacyError;
      
      // If no linked contracts, just return legacy
      if (contractIds.length === 0) {
        return legacyContracts || [];
      }
      
      // Get contracts from links
      const { data: linkedContracts, error: linkedError } = await supabase
        .from("contracts")
        .select("*")
        .in("id", contractIds);
      
      if (linkedError) throw linkedError;
      
      // Merge and dedupe
      const allContracts = [...(legacyContracts || [])];
      linkedContracts?.forEach(c => {
        if (!allContracts.some(ac => ac.id === c.id)) {
          allContracts.push(c);
        }
      });
      
      return allContracts;
    },
    enabled: !!entityId,
  });
};

const EntityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { canWrite } = useUserRole();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();
  
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { data: bankAccounts, isLoading: bankLoading } = useBankAccounts();
  const { data: creditCards, isLoading: cardsLoading } = useCreditCards();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: linkedContracts, isLoading: contractsLoading } = useContractsForEntity(id || "");
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
  const { data: entityWebsites, isLoading: websitesLoading } = useEntityWebsites();
  const { data: entitySoftware, isLoading: softwareLoading } = useEntitySoftware();

  const entity = entities?.find(e => e.id === id);
  const linkedBankAccounts = bankAccounts?.filter(b => b.entity_id === id) ?? [];
  const linkedCreditCards = creditCards?.filter(c => c.entity_id === id) ?? [];
  const linkedAddresses = addresses?.filter(a => a.entity_id === id) ?? [];
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
  const linkedWebsites = entityWebsites?.filter(w => w.entity_id === id) ?? [];
  const linkedEntitySoftware = entitySoftware?.filter(s => s.entity_id === id) ?? [];

  const isLoading = entitiesLoading || bankLoading || cardsLoading || addressesLoading || 
    contractsLoading || phonesLoading || taxIdsLoading || accountantsLoading || 
    lawFirmsLoading || agentsLoading || advisorsLoading || consultantsLoading || auditorsLoading || docsLoading || filingsLoading || tasksLoading || socialLoading || directorsLoading || emailsLoading || websitesLoading || softwareLoading;

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

      {/* Entity Header - Compact Design */}
      <div className="glass-card rounded-xl p-6 mb-6">
        {/* Top Row: Logo, Name, Status, Actions */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <CompanyLogo 
              domain={(entity as any).website}
              name={entity.name} 
              size="md"
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{entity.name}</h1>
                <Badge variant={entity.status === "Active" ? "default" : "secondary"} className="text-xs">
                  {entity.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
                <span>{entity.type}</span>
                {entity.founded_date && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Founded {format(new Date(entity.founded_date), "MMM yyyy")}
                    </span>
                  </>
                )}
                {entity.jurisdiction && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {entity.jurisdiction}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {canWrite && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)} className="gap-1.5 h-8">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="gap-1.5 h-8 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Primary Info Grid - Compact 3-column layout */}
        {(linkedAddresses.some(a => a.is_primary) || 
          linkedPhoneNumbers.some(p => p.is_primary) || 
          linkedTaxIds.some(t => t.is_primary) || 
          linkedEmails.some(e => e.is_primary) ||
          linkedBankAccounts.some(b => b.is_primary) ||
          linkedDirectorsUbos.some(d => d.is_primary) ||
          linkedSocialMedia.length > 0) && (
          <>
            <div className="border-t border-border/50 my-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Primary Email */}
              {linkedEmails.filter(e => e.is_primary).slice(0, 1).map(email => (
                <div key={email.id} className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-sm text-foreground truncate">{email.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{email.label}</p>
                </div>
              ))}

              {/* Primary Phones */}
              {linkedPhoneNumbers.filter(p => p.is_primary).slice(0, 2).map(phone => (
                <div key={phone.id} className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="text-sm text-foreground font-mono truncate">
                    {phone.country_code} {phone.phone_number}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{phone.label}</p>
                </div>
              ))}

              {/* Primary Address */}
              {linkedAddresses.filter(a => a.is_primary).slice(0, 1).map(address => (
                <div key={address.id} className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </p>
                  <p className="text-sm text-foreground truncate">{address.street}</p>
                  <p className="text-xs text-muted-foreground truncate">{address.city}, {address.state} {address.zip}</p>
                </div>
              ))}

              {/* Primary Tax ID */}
              {linkedTaxIds.filter(t => t.is_primary).slice(0, 1).map(taxId => (
                <div key={taxId.id} className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Receipt className="w-3 h-3" /> Tax ID
                  </p>
                  <p className="text-sm text-foreground font-mono truncate">{taxId.tax_id_number}</p>
                  <p className="text-xs text-muted-foreground truncate">{taxId.type}</p>
                </div>
              ))}

              {/* Primary Bank */}
              {linkedBankAccounts.filter(b => b.is_primary).slice(0, 1).map(account => (
                <div key={account.id} className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> Bank
                  </p>
                  <p className="text-sm text-foreground truncate">{account.bank}</p>
                  <p className="text-xs text-muted-foreground font-mono">••••{account.account_number.slice(-4)}</p>
                </div>
              ))}

              {/* Primary Contact */}
              {linkedDirectorsUbos.filter(d => d.is_primary).slice(0, 1).map(director => (
                <div key={director.id} className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Contact
                  </p>
                  <p className="text-sm text-foreground truncate">{director.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{director.title || director.role_type}</p>
                </div>
              ))}

              {/* Social Media - Inline badges */}
              {linkedSocialMedia.length > 0 && (
                <div className="min-w-0 col-span-2 md:col-span-1 xl:col-span-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Social
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedSocialMedia.slice(0, 5).map(social => (
                      <a
                        key={social.id}
                        href={social.profile_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white transition-opacity hover:opacity-80`}
                        style={{ backgroundColor: social.color?.replace('bg-', '') || '#3f3f46' }}
                      >
                        {social.avatar_url && (
                          <img src={social.avatar_url} alt="" className="w-3 h-3 rounded-full" />
                        )}
                        <span>{social.platform}</span>
                        {social.is_verified && <span>✓</span>}
                      </a>
                    ))}
                    {linkedSocialMedia.length > 5 && (
                      <span className="text-[10px] text-muted-foreground self-center">+{linkedSocialMedia.length - 5}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Description of Activities */}
        {(entity as any)?.description_of_activities && (
          <>
            <div className="border-t border-border/50 my-4" />
            <div className="flex items-start gap-3">
              <DescriptionIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Description of Activities</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{(entity as any).description_of_activities}</p>
              </div>
            </div>
          </>
        )}
      </div>

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
        <LinkedDirectorsUbos directorsUbos={linkedDirectorsUbos} entityId={id!} entityName={entity.name} />
        <LinkedPhoneNumbers phones={linkedPhoneNumbers} entityId={id!} />
        <LinkedEmailAddresses emails={linkedEmails} entityId={id!} />
        <LinkedTaxIds taxIds={linkedTaxIds} entityId={id!} />
        <LinkedAddresses entityId={id!} />
        <LinkedDocuments documents={linkedDocuments} entityId={id!} />
        <LinkedContracts contracts={linkedContracts} />
        <LinkedWebsites websites={linkedWebsites} entityId={id!} />
        <LinkedSoftware software={linkedEntitySoftware} entityId={id!} />
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

      {/* Delete Entity Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          deleteEntity.mutate(entity.id, {
            onSuccess: () => {
              setIsDeleteDialogOpen(false);
              navigate("/");
            },
          });
        }}
        title="Delete Entity"
        description={`Are you sure you want to delete "${entity.name}"? You must remove or reassign all linked items (bank accounts, contracts, documents, etc.) before the entity can be deleted.`}
        isLoading={deleteEntity.isPending}
      />
    </div>
  );
};

export default EntityDetail;
