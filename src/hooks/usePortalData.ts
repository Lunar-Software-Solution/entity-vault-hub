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
