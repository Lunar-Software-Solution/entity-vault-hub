import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Entity = Tables<"entities">;
export type BankAccount = Tables<"bank_accounts">;
export type CreditCard = Tables<"credit_cards">;
export type SocialMediaAccount = Tables<"social_media_accounts">;
export type Address = Tables<"addresses">;
export type Contract = Tables<"contracts">;
export type PhoneNumber = Tables<"phone_numbers">;
export type TaxId = Tables<"tax_ids">;
export type TaxIdType = Tables<"tax_id_types">;
export type IssuingAuthority = Tables<"issuing_authorities">;
export type AccountantFirm = Tables<"accountant_firms">;
export type LawFirm = Tables<"law_firms">;
export type RegistrationAgent = Tables<"registration_agents">;
export type Advisor = Tables<"advisors">;
export type Consultant = Tables<"consultants">;
export type Auditor = Tables<"auditors">;
export type EntityProviderContract = Tables<"entity_provider_contracts">;
export type DocumentType = Tables<"document_types">;
export type EntityDocument = Tables<"entity_documents">;
export type FilingType = Tables<"filing_types">;
export type EntityFiling = Tables<"entity_filings">;
export type FilingTask = Tables<"filing_tasks">;
export type FilingDocument = Tables<"filing_documents">;
export type AuditLog = Tables<"audit_logs">;
export type EmailAddress = Tables<"email_addresses">;
export type DirectorUbo = Tables<"directors_ubos">;

// Recent audit logs hook
export const useRecentAuditLogs = (limit: number = 10) => {
  return useQuery({
    queryKey: ["audit_logs", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as AuditLog[];
    },
  });
};
export const useEntities = () => {
  return useQuery({
    queryKey: ["entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Entity[];
    },
  });
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ["bank_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BankAccount[];
    },
  });
};

export const useCreditCards = () => {
  return useQuery({
    queryKey: ["credit_cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_cards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CreditCard[];
    },
  });
};

export const useSocialMediaAccounts = () => {
  return useQuery({
    queryKey: ["social_media_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SocialMediaAccount[];
    },
  });
};

export const useAddresses = () => {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data as Address[];
    },
  });
};

export const useContracts = () => {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contract[];
    },
  });
};

export const usePhoneNumbers = () => {
  return useQuery({
    queryKey: ["phone_numbers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phone_numbers")
        .select("*")
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data as PhoneNumber[];
    },
  });
};

export const useEmailAddresses = () => {
  return useQuery({
    queryKey: ["email_addresses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_addresses")
        .select("*")
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data as EmailAddress[];
    },
  });
};

export const useTaxIds = () => {
  return useQuery({
    queryKey: ["tax_ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_ids")
        .select("*")
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data as TaxId[];
    },
  });
};

export const useTaxIdTypes = () => {
  return useQuery({
    queryKey: ["tax_id_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_id_types")
        .select("*")
        .order("code", { ascending: true });
      if (error) throw error;
      return data as TaxIdType[];
    },
  });
};

export const useIssuingAuthorities = () => {
  return useQuery({
    queryKey: ["issuing_authorities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issuing_authorities")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as IssuingAuthority[];
    },
  });
};

// Get tax id types for an authority (via authority_id foreign key on tax_id_types)
export const useTaxIdTypesForAuthority = (authorityId?: string) => {
  return useQuery({
    queryKey: ["tax_id_types", "by_authority", authorityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_id_types")
        .select("*")
        .eq("authority_id", authorityId!);
      if (error) throw error;
      return data as TaxIdType[];
    },
    enabled: !!authorityId,
  });
};

// Service Provider hooks
export const useAccountantFirms = () => {
  return useQuery({
    queryKey: ["accountant_firms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accountant_firms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AccountantFirm[];
    },
  });
};

export const useLawFirms = () => {
  return useQuery({
    queryKey: ["law_firms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("law_firms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LawFirm[];
    },
  });
};

export const useRegistrationAgents = () => {
  return useQuery({
    queryKey: ["registration_agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_agents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RegistrationAgent[];
    },
  });
};

export const useAdvisors = () => {
  return useQuery({
    queryKey: ["advisors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advisors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Advisor[];
    },
  });
};

export const useConsultants = () => {
  return useQuery({
    queryKey: ["consultants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Consultant[];
    },
  });
};

export const useAuditors = () => {
  return useQuery({
    queryKey: ["auditors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auditors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Auditor[];
    },
  });
};

// Document Type hooks
export const useDocumentTypes = () => {
  return useQuery({
    queryKey: ["document_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_types")
        .select("*")
        .order("category", { ascending: true });
      if (error) throw error;
      return data as DocumentType[];
    },
  });
};

// Entity Documents hooks
export const useEntityDocuments = () => {
  return useQuery({
    queryKey: ["entity_documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EntityDocument[];
    },
  });
};

// Filing Types hooks
export const useFilingTypes = () => {
  return useQuery({
    queryKey: ["filing_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filing_types")
        .select("*")
        .order("category", { ascending: true });
      if (error) throw error;
      return data as FilingType[];
    },
  });
};

// Entity Filings hooks
export const useEntityFilings = () => {
  return useQuery({
    queryKey: ["entity_filings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_filings")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as EntityFiling[];
    },
  });
};

// Filings for a specific entity
export const useFilingsForEntity = (entityId?: string) => {
  return useQuery({
    queryKey: ["entity_filings", "by_entity", entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_filings")
        .select("*")
        .eq("entity_id", entityId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as EntityFiling[];
    },
    enabled: !!entityId,
  });
};

// Upcoming filings (next 90 days)
export const useUpcomingFilings = () => {
  return useQuery({
    queryKey: ["entity_filings", "upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const future = new Date();
      future.setDate(future.getDate() + 90);
      const futureDate = future.toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("entity_filings")
        .select("*")
        .gte("due_date", today)
        .lte("due_date", futureDate)
        .neq("status", "filed")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as EntityFiling[];
    },
  });
};

// Filing Tasks hooks
export const useFilingTasks = () => {
  return useQuery({
    queryKey: ["filing_tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filing_tasks")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as FilingTask[];
    },
  });
};

// Tasks for a specific entity
export const useTasksForEntity = (entityId?: string) => {
  return useQuery({
    queryKey: ["filing_tasks", "by_entity", entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filing_tasks")
        .select("*")
        .eq("entity_id", entityId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as FilingTask[];
    },
    enabled: !!entityId,
  });
};

// Open/pending tasks
export const useOpenTasks = () => {
  return useQuery({
    queryKey: ["filing_tasks", "open"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filing_tasks")
        .select("*")
        .in("status", ["pending", "in_progress"])
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as FilingTask[];
    },
  });
};

// Overdue tasks
export const useOverdueTasks = () => {
  return useQuery({
    queryKey: ["filing_tasks", "overdue"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("filing_tasks")
        .select("*")
        .lt("due_date", today)
        .in("status", ["pending", "in_progress"])
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as FilingTask[];
    },
  });
};

// Filing Documents hooks
export const useFilingDocuments = (filingId?: string) => {
  return useQuery({
    queryKey: ["filing_documents", filingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filing_documents")
        .select("*")
        .eq("filing_id", filingId!);
      if (error) throw error;
      return data as FilingDocument[];
    },
    enabled: !!filingId,
  });
};

// Dashboard stats hook
export const useDashboardStats = () => {
  const { data: bankAccounts } = useBankAccounts();
  const { data: creditCards } = useCreditCards();
  const { data: socialAccounts } = useSocialMediaAccounts();
  const { data: contracts } = useContracts();
  const { data: addresses } = useAddresses();
  const { data: entities } = useEntities();
  const { data: upcomingFilings } = useUpcomingFilings();
  const { data: openTasks } = useOpenTasks();
  const { data: overdueTasks } = useOverdueTasks();
  const { data: phoneNumbers } = usePhoneNumbers();
  const { data: taxIds } = useTaxIds();
  const { data: documents } = useEntityDocuments();
  const { data: lawFirms } = useLawFirms();
  const { data: accountantFirms } = useAccountantFirms();
  const { data: advisors } = useAdvisors();
  const { data: auditors } = useAuditors();
  const { data: consultants } = useConsultants();
  const { data: registrationAgents } = useRegistrationAgents();

  const totalCreditLimit = creditCards?.reduce((sum, card) => sum + Number(card.credit_limit), 0) ?? 0;
  const activeContracts = contracts?.filter(c => c.status === "active").length ?? 0;
  const expiringContracts = contracts?.filter(c => c.status === "expiring-soon").length ?? 0;
  
  // Calculate service provider totals
  const totalServiceProviders = 
    (lawFirms?.length ?? 0) + 
    (accountantFirms?.length ?? 0) + 
    (advisors?.length ?? 0) + 
    (auditors?.length ?? 0) + 
    (consultants?.length ?? 0) + 
    (registrationAgents?.length ?? 0);
    
  const activeServiceProviders = 
    (lawFirms?.filter(f => f.is_active).length ?? 0) + 
    (accountantFirms?.filter(f => f.is_active).length ?? 0) + 
    (advisors?.filter(f => f.is_active).length ?? 0) + 
    (auditors?.filter(f => f.is_active).length ?? 0) + 
    (consultants?.filter(f => f.is_active).length ?? 0) + 
    (registrationAgents?.filter(f => f.is_active).length ?? 0);

  return {
    totalCreditLimit,
    bankAccountCount: bankAccounts?.length ?? 0,
    creditCardCount: creditCards?.length ?? 0,
    socialAccountCount: socialAccounts?.length ?? 0,
    activeContracts,
    expiringContracts,
    addressCount: addresses?.length ?? 0,
    entityStatus: entities?.[0]?.status ?? "No Entity",
    entityFoundedDate: entities?.[0]?.founded_date,
    entityCount: entities?.length ?? 0,
    upcomingFilingsCount: upcomingFilings?.length ?? 0,
    openTasksCount: openTasks?.length ?? 0,
    overdueTasksCount: overdueTasks?.length ?? 0,
    phoneNumberCount: phoneNumbers?.length ?? 0,
    taxIdCount: taxIds?.length ?? 0,
    documentCount: documents?.length ?? 0,
    totalServiceProviders,
    activeServiceProviders,
  };
};
