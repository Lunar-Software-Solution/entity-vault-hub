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

// Dashboard stats hook
export const useDashboardStats = () => {
  const { data: bankAccounts } = useBankAccounts();
  const { data: creditCards } = useCreditCards();
  const { data: socialAccounts } = useSocialMediaAccounts();
  const { data: contracts } = useContracts();
  const { data: addresses } = useAddresses();
  const { data: entities } = useEntities();

  const totalCreditLimit = creditCards?.reduce((sum, card) => sum + Number(card.credit_limit), 0) ?? 0;
  const activeContracts = contracts?.filter(c => c.status === "active").length ?? 0;
  const expiringContracts = contracts?.filter(c => c.status === "expiring-soon").length ?? 0;

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
  };
};
