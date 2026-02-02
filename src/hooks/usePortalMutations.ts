import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

// Entity mutations
export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entity: TablesInsert<"entities">) => {
      const { data, error } = await supabase.from("entities").insert(entity).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast.success("Entity created successfully");
    },
    onError: (error) => toast.error(`Failed to create entity: ${error.message}`),
  });
};

export const useUpdateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...entity }: TablesUpdate<"entities"> & { id: string }) => {
      const { data, error } = await supabase.from("entities").update(entity).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast.success("Entity updated successfully");
    },
    onError: (error) => toast.error(`Failed to update entity: ${error.message}`),
  });
};

export const useDeleteEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast.success("Entity deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete entity: ${error.message}`),
  });
};

// Bank Account mutations
export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: TablesInsert<"bank_accounts">) => {
      const { data, error } = await supabase.from("bank_accounts").insert(account).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
      toast.success("Bank account added successfully");
    },
    onError: (error) => toast.error(`Failed to add bank account: ${error.message}`),
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...account }: TablesUpdate<"bank_accounts"> & { id: string }) => {
      const { data, error } = await supabase.from("bank_accounts").update(account).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
      toast.success("Bank account updated successfully");
    },
    onError: (error) => toast.error(`Failed to update bank account: ${error.message}`),
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
      toast.success("Bank account deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete bank account: ${error.message}`),
  });
};

// Credit Card mutations
export const useCreateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (card: TablesInsert<"credit_cards">) => {
      const { data, error } = await supabase.from("credit_cards").insert(card).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast.success("Credit card added successfully");
    },
    onError: (error) => toast.error(`Failed to add credit card: ${error.message}`),
  });
};

export const useUpdateCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...card }: TablesUpdate<"credit_cards"> & { id: string }) => {
      const { data, error } = await supabase.from("credit_cards").update(card).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast.success("Credit card updated successfully");
    },
    onError: (error) => toast.error(`Failed to update credit card: ${error.message}`),
  });
};

export const useDeleteCreditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("credit_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit_cards"] });
      toast.success("Credit card deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete credit card: ${error.message}`),
  });
};

// Address mutations
export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: TablesInsert<"addresses">) => {
      const { data, error } = await supabase.from("addresses").insert(address).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added successfully");
    },
    onError: (error) => toast.error(`Failed to add address: ${error.message}`),
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...address }: TablesUpdate<"addresses"> & { id: string }) => {
      const { data, error } = await supabase.from("addresses").update(address).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated successfully");
    },
    onError: (error) => toast.error(`Failed to update address: ${error.message}`),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete address: ${error.message}`),
  });
};

// Contract mutations
export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contract: TablesInsert<"contracts">) => {
      const { data, error } = await supabase.from("contracts").insert(contract).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contract added successfully");
    },
    onError: (error) => toast.error(`Failed to add contract: ${error.message}`),
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...contract }: TablesUpdate<"contracts"> & { id: string }) => {
      const { data, error } = await supabase.from("contracts").update(contract).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contract updated successfully");
    },
    onError: (error) => toast.error(`Failed to update contract: ${error.message}`),
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contracts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contract deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete contract: ${error.message}`),
  });
};

// Social Media Account mutations
export const useCreateSocialMediaAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: TablesInsert<"social_media_accounts">) => {
      const { data, error } = await supabase.from("social_media_accounts").insert(account).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social_media_accounts"] });
      toast.success("Social media account linked successfully");
    },
    onError: (error) => toast.error(`Failed to link account: ${error.message}`),
  });
};

export const useUpdateSocialMediaAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...account }: TablesUpdate<"social_media_accounts"> & { id: string }) => {
      const { data, error } = await supabase.from("social_media_accounts").update(account).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social_media_accounts"] });
      toast.success("Social media account updated successfully");
    },
    onError: (error) => toast.error(`Failed to update account: ${error.message}`),
  });
};

export const useDeleteSocialMediaAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_media_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social_media_accounts"] });
      toast.success("Social media account removed successfully");
    },
    onError: (error) => toast.error(`Failed to remove account: ${error.message}`),
  });
};

// Phone Number mutations
export const useCreatePhoneNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phone: TablesInsert<"phone_numbers">) => {
      const { data, error } = await supabase.from("phone_numbers").insert(phone).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone_numbers"] });
      toast.success("Phone number added successfully");
    },
    onError: (error) => toast.error(`Failed to add phone number: ${error.message}`),
  });
};

export const useUpdatePhoneNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...phone }: TablesUpdate<"phone_numbers"> & { id: string }) => {
      const { data, error } = await supabase.from("phone_numbers").update(phone).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone_numbers"] });
      toast.success("Phone number updated successfully");
    },
    onError: (error) => toast.error(`Failed to update phone number: ${error.message}`),
  });
};

export const useDeletePhoneNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("phone_numbers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone_numbers"] });
      toast.success("Phone number deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete phone number: ${error.message}`),
  });
};

// Tax ID mutations
export const useCreateTaxId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taxId: TablesInsert<"tax_ids">) => {
      const { data, error } = await supabase.from("tax_ids").insert(taxId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_ids"] });
      toast.success("Tax ID added successfully");
    },
    onError: (error) => toast.error(`Failed to add tax ID: ${error.message}`),
  });
};

export const useUpdateTaxId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...taxId }: TablesUpdate<"tax_ids"> & { id: string }) => {
      const { data, error } = await supabase.from("tax_ids").update(taxId).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_ids"] });
      toast.success("Tax ID updated successfully");
    },
    onError: (error) => toast.error(`Failed to update tax ID: ${error.message}`),
  });
};

export const useDeleteTaxId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tax_ids").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_ids"] });
      toast.success("Tax ID deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete tax ID: ${error.message}`),
  });
};

// Tax ID Type mutations
export const useCreateTaxIdType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (type: TablesInsert<"tax_id_types">) => {
      const { data, error } = await supabase.from("tax_id_types").insert(type).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_id_types"] });
      toast.success("Tax ID type added successfully");
    },
    onError: (error) => toast.error(`Failed to add tax ID type: ${error.message}`),
  });
};

export const useUpdateTaxIdType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...type }: TablesUpdate<"tax_id_types"> & { id: string }) => {
      const { data, error } = await supabase.from("tax_id_types").update(type).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_id_types"] });
      toast.success("Tax ID type updated successfully");
    },
    onError: (error) => toast.error(`Failed to update tax ID type: ${error.message}`),
  });
};

export const useDeleteTaxIdType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tax_id_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_id_types"] });
      toast.success("Tax ID type deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete tax ID type: ${error.message}`),
  });
};

// Issuing Authority mutations
export const useCreateIssuingAuthority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (authority: TablesInsert<"issuing_authorities">) => {
      const { data, error } = await supabase.from("issuing_authorities").insert(authority).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issuing_authorities"] });
      toast.success("Issuing authority added successfully");
    },
    onError: (error) => toast.error(`Failed to add issuing authority: ${error.message}`),
  });
};

export const useUpdateIssuingAuthority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...authority }: TablesUpdate<"issuing_authorities"> & { id: string }) => {
      const { data, error } = await supabase.from("issuing_authorities").update(authority).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issuing_authorities"] });
      toast.success("Issuing authority updated successfully");
    },
    onError: (error) => toast.error(`Failed to update issuing authority: ${error.message}`),
  });
};

export const useDeleteIssuingAuthority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("issuing_authorities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issuing_authorities"] });
      toast.success("Issuing authority deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete issuing authority: ${error.message}`),
  });
};

// Accountant Firm mutations
export const useCreateAccountantFirm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (firm: TablesInsert<"accountant_firms">) => {
      const { data, error } = await supabase.from("accountant_firms").insert(firm).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountant_firms"] });
      toast.success("Accountant firm added successfully");
    },
    onError: (error) => toast.error(`Failed to add accountant firm: ${error.message}`),
  });
};

export const useUpdateAccountantFirm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...firm }: TablesUpdate<"accountant_firms"> & { id: string }) => {
      const { data, error } = await supabase.from("accountant_firms").update(firm).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountant_firms"] });
      toast.success("Accountant firm updated successfully");
    },
    onError: (error) => toast.error(`Failed to update accountant firm: ${error.message}`),
  });
};

export const useDeleteAccountantFirm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accountant_firms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountant_firms"] });
      toast.success("Accountant firm deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete accountant firm: ${error.message}`),
  });
};

// Law Firm mutations
export const useCreateLawFirm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (firm: TablesInsert<"law_firms">) => {
      const { data, error } = await supabase.from("law_firms").insert(firm).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["law_firms"] });
      toast.success("Law firm added successfully");
    },
    onError: (error) => toast.error(`Failed to add law firm: ${error.message}`),
  });
};

export const useUpdateLawFirm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...firm }: TablesUpdate<"law_firms"> & { id: string }) => {
      const { data, error } = await supabase.from("law_firms").update(firm).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["law_firms"] });
      toast.success("Law firm updated successfully");
    },
    onError: (error) => toast.error(`Failed to update law firm: ${error.message}`),
  });
};

export const useDeleteLawFirm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("law_firms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["law_firms"] });
      toast.success("Law firm deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete law firm: ${error.message}`),
  });
};

// Registration Agent mutations
export const useCreateRegistrationAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: TablesInsert<"registration_agents">) => {
      const { data, error } = await supabase.from("registration_agents").insert(agent).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration_agents"] });
      toast.success("Registration agent added successfully");
    },
    onError: (error) => toast.error(`Failed to add registration agent: ${error.message}`),
  });
};

export const useUpdateRegistrationAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...agent }: TablesUpdate<"registration_agents"> & { id: string }) => {
      const { data, error } = await supabase.from("registration_agents").update(agent).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration_agents"] });
      toast.success("Registration agent updated successfully");
    },
    onError: (error) => toast.error(`Failed to update registration agent: ${error.message}`),
  });
};

export const useDeleteRegistrationAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registration_agents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration_agents"] });
      toast.success("Registration agent deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete registration agent: ${error.message}`),
  });
};

// Advisor mutations
export const useCreateAdvisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (advisor: TablesInsert<"advisors">) => {
      const { data, error } = await supabase.from("advisors").insert(advisor).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisors"] });
      toast.success("Advisor added successfully");
    },
    onError: (error) => toast.error(`Failed to add advisor: ${error.message}`),
  });
};

export const useUpdateAdvisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...advisor }: TablesUpdate<"advisors"> & { id: string }) => {
      const { data, error } = await supabase.from("advisors").update(advisor).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisors"] });
      toast.success("Advisor updated successfully");
    },
    onError: (error) => toast.error(`Failed to update advisor: ${error.message}`),
  });
};

export const useDeleteAdvisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("advisors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisors"] });
      toast.success("Advisor deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete advisor: ${error.message}`),
  });
};

// Consultant mutations
export const useCreateConsultant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (consultant: TablesInsert<"consultants">) => {
      const { data, error } = await supabase.from("consultants").insert(consultant).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultants"] });
      toast.success("Consultant added successfully");
    },
    onError: (error) => toast.error(`Failed to add consultant: ${error.message}`),
  });
};

export const useUpdateConsultant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...consultant }: TablesUpdate<"consultants"> & { id: string }) => {
      const { data, error } = await supabase.from("consultants").update(consultant).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultants"] });
      toast.success("Consultant updated successfully");
    },
    onError: (error) => toast.error(`Failed to update consultant: ${error.message}`),
  });
};

export const useDeleteConsultant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("consultants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultants"] });
      toast.success("Consultant deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete consultant: ${error.message}`),
  });
};

// Auditor mutations
export const useCreateAuditor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (auditor: TablesInsert<"auditors">) => {
      const { data, error } = await supabase.from("auditors").insert(auditor).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      toast.success("Auditor added successfully");
    },
    onError: (error) => toast.error(`Failed to add auditor: ${error.message}`),
  });
};

export const useUpdateAuditor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...auditor }: TablesUpdate<"auditors"> & { id: string }) => {
      const { data, error } = await supabase.from("auditors").update(auditor).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      toast.success("Auditor updated successfully");
    },
    onError: (error) => toast.error(`Failed to update auditor: ${error.message}`),
  });
};

export const useDeleteAuditor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("auditors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      toast.success("Auditor deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete auditor: ${error.message}`),
  });
};

// Document Type mutations
export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (type: TablesInsert<"document_types">) => {
      const { data, error } = await supabase.from("document_types").insert(type).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document_types"] });
      toast.success("Document type added successfully");
    },
    onError: (error) => toast.error(`Failed to add document type: ${error.message}`),
  });
};

export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...type }: TablesUpdate<"document_types"> & { id: string }) => {
      const { data, error } = await supabase.from("document_types").update(type).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document_types"] });
      toast.success("Document type updated successfully");
    },
    onError: (error) => toast.error(`Failed to update document type: ${error.message}`),
  });
};

export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("document_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document_types"] });
      toast.success("Document type deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete document type: ${error.message}`),
  });
};

// Entity Document mutations
export const useCreateEntityDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doc: TablesInsert<"entity_documents">) => {
      const { data, error } = await supabase.from("entity_documents").insert(doc).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_documents"] });
      toast.success("Document added successfully");
    },
    onError: (error) => toast.error(`Failed to add document: ${error.message}`),
  });
};

export const useUpdateEntityDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...doc }: TablesUpdate<"entity_documents"> & { id: string }) => {
      const { data, error } = await supabase.from("entity_documents").update(doc).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_documents"] });
      toast.success("Document updated successfully");
    },
    onError: (error) => toast.error(`Failed to update document: ${error.message}`),
  });
};

export const useDeleteEntityDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entity_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_documents"] });
      toast.success("Document deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete document: ${error.message}`),
  });
};

// Filing Type mutations
export const useCreateFilingType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (type: TablesInsert<"filing_types">) => {
      const { data, error } = await supabase.from("filing_types").insert(type).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filing_types"] });
      toast.success("Filing type added successfully");
    },
    onError: (error) => toast.error(`Failed to add filing type: ${error.message}`),
  });
};

export const useUpdateFilingType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...type }: TablesUpdate<"filing_types"> & { id: string }) => {
      const { data, error } = await supabase.from("filing_types").update(type).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filing_types"] });
      toast.success("Filing type updated successfully");
    },
    onError: (error) => toast.error(`Failed to update filing type: ${error.message}`),
  });
};

export const useDeleteFilingType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("filing_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filing_types"] });
      toast.success("Filing type deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete filing type: ${error.message}`),
  });
};

// Entity Filing mutations
export const useCreateEntityFiling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filing: TablesInsert<"entity_filings">) => {
      const { data, error } = await supabase.from("entity_filings").insert(filing).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_filings"] });
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      toast.success("Filing added successfully");
    },
    onError: (error) => toast.error(`Failed to add filing: ${error.message}`),
  });
};

export const useUpdateEntityFiling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...filing }: TablesUpdate<"entity_filings"> & { id: string }) => {
      const { data, error } = await supabase.from("entity_filings").update(filing).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_filings"] });
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      toast.success("Filing updated successfully");
    },
    onError: (error) => toast.error(`Failed to update filing: ${error.message}`),
  });
};

export const useDeleteEntityFiling = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entity_filings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_filings"] });
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      toast.success("Filing deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete filing: ${error.message}`),
  });
};

// Filing Task mutations
export const useCreateFilingTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: TablesInsert<"filing_tasks">) => {
      const { data, error } = await supabase.from("filing_tasks").insert(task).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      toast.success("Task added successfully");
    },
    onError: (error) => toast.error(`Failed to add task: ${error.message}`),
  });
};

export const useUpdateFilingTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...task }: TablesUpdate<"filing_tasks"> & { id: string }) => {
      const { data, error } = await supabase.from("filing_tasks").update(task).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      toast.success("Task updated successfully");
    },
    onError: (error) => toast.error(`Failed to update task: ${error.message}`),
  });
};

export const useDeleteFilingTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("filing_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      toast.success("Task deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete task: ${error.message}`),
  });
};

// Helper mutations for task status
export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // First, get the task to check for filing_id
      const { data: task, error: fetchError } = await supabase
        .from("filing_tasks")
        .select("filing_id")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update the task status
      const { data, error } = await supabase
        .from("filing_tasks")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // If task has an associated filing, mark it as filed
      if (task?.filing_id) {
        await supabase
          .from("entity_filings")
          .update({ 
            status: "filed", 
            filing_date: new Date().toISOString().split("T")[0] 
          })
          .eq("id", task.filing_id);
      }
      
      return { task: data, filingUpdated: !!task?.filing_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["entity_filings"] });
      if (result.filingUpdated) {
        toast.success("Task completed and filing marked as filed!");
      } else {
        toast.success("Task completed!");
      }
    },
    onError: (error) => toast.error(`Failed to complete task: ${error.message}`),
  });
};

export const useReopenTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("filing_tasks")
        .update({ status: "pending", completed_at: null })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      toast.success("Task reopened");
    },
    onError: (error) => toast.error(`Failed to reopen task: ${error.message}`),
  });
};

// Mark filing as filed
export const useMarkFilingFiled = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, filingDate, confirmationNumber }: { id: string; filingDate?: string; confirmationNumber?: string }) => {
      const { data, error } = await supabase
        .from("entity_filings")
        .update({ 
          status: "filed", 
          filing_date: filingDate || new Date().toISOString().split("T")[0],
          confirmation_number: confirmationNumber || undefined
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_filings"] });
      toast.success("Filing marked as filed!");
    },
    onError: (error) => toast.error(`Failed to update filing: ${error.message}`),
  });
};

// Entity Website mutations
export const useCreateEntityWebsite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (website: TablesInsert<"entity_websites">) => {
      const { data, error } = await supabase.from("entity_websites").insert(website).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_websites"] });
      toast.success("Website added successfully");
    },
    onError: (error) => toast.error(`Failed to add website: ${error.message}`),
  });
};

export const useUpdateEntityWebsite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...website }: TablesUpdate<"entity_websites"> & { id: string }) => {
      const { data, error } = await supabase.from("entity_websites").update(website).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_websites"] });
      toast.success("Website updated successfully");
    },
    onError: (error) => toast.error(`Failed to update website: ${error.message}`),
  });
};

export const useDeleteEntityWebsite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entity_websites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_websites"] });
      toast.success("Website deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete website: ${error.message}`),
  });
};

// Software Catalog mutations
export const useCreateSoftwareCatalog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (software: TablesInsert<"software_catalog">) => {
      const { data, error } = await supabase.from("software_catalog").insert(software).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["software_catalog"] });
      toast.success("Software added to catalog successfully");
    },
    onError: (error) => toast.error(`Failed to add software: ${error.message}`),
  });
};

export const useUpdateSoftwareCatalog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...software }: TablesUpdate<"software_catalog"> & { id: string }) => {
      const { data, error } = await supabase.from("software_catalog").update(software).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["software_catalog"] });
      toast.success("Software updated successfully");
    },
    onError: (error) => toast.error(`Failed to update software: ${error.message}`),
  });
};

export const useDeleteSoftwareCatalog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("software_catalog").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["software_catalog"] });
      toast.success("Software deleted from catalog");
    },
    onError: (error) => toast.error(`Failed to delete software: ${error.message}`),
  });
};

// Entity Software mutations
export const useCreateEntitySoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (software: TablesInsert<"entity_software">) => {
      const { data, error } = await supabase.from("entity_software").insert(software).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_software"] });
      toast.success("Software added successfully");
    },
    onError: (error) => toast.error(`Failed to add software: ${error.message}`),
  });
};

export const useUpdateEntitySoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...software }: TablesUpdate<"entity_software"> & { id: string }) => {
      const { data, error } = await supabase.from("entity_software").update(software).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_software"] });
      toast.success("Software updated successfully");
    },
    onError: (error) => toast.error(`Failed to update software: ${error.message}`),
  });
};

export const useDeleteEntitySoftware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entity_software").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity_software"] });
      toast.success("Software deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete software: ${error.message}`),
  });
};

// Bulk Task mutations
export const useBulkDeleteTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("filing_tasks").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      toast.success(`${ids.length} task(s) deleted successfully`);
    },
    onError: (error) => toast.error(`Failed to delete tasks: ${error.message}`),
  });
};

export const useBulkUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const updateData: { status: string; completed_at?: string | null } = { status };
      
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
      
      const { error } = await supabase
        .from("filing_tasks")
        .update(updateData)
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, { ids, status }) => {
      queryClient.invalidateQueries({ queryKey: ["filing_tasks"] });
      const statusLabel = status === "in_progress" ? "In Progress" : 
                          status.charAt(0).toUpperCase() + status.slice(1);
      toast.success(`${ids.length} task(s) updated to ${statusLabel}`);
    },
    onError: (error) => toast.error(`Failed to update tasks: ${error.message}`),
  });
};

// Bulk create entity websites (for Cloudflare import)
export const useBulkCreateEntityWebsites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (websites: TablesInsert<"entity_websites">[]) => {
      const { data, error } = await supabase
        .from("entity_websites")
        .insert(websites)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["entity_websites"] });
      queryClient.invalidateQueries({ queryKey: ["website-entity-links-all"] });
      toast.success(`${data.length} website${data.length !== 1 ? "s" : ""} imported successfully`);
    },
    onError: (error) => toast.error(`Failed to import websites: ${error.message}`),
  });
};

// Website Type mutations
export const useCreateWebsiteType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (type: TablesInsert<"website_types">) => {
      const { data, error } = await supabase.from("website_types").insert(type).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_types"] });
      toast.success("Website type added successfully");
    },
    onError: (error) => toast.error(`Failed to add website type: ${error.message}`),
  });
};

export const useUpdateWebsiteType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...type }: TablesUpdate<"website_types"> & { id: string }) => {
      const { data, error } = await supabase.from("website_types").update(type).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_types"] });
      toast.success("Website type updated successfully");
    },
    onError: (error) => toast.error(`Failed to update website type: ${error.message}`),
  });
};

export const useDeleteWebsiteType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("website_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_types"] });
      toast.success("Website type deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete website type: ${error.message}`),
  });
};

// Website Platform mutations
export const useCreateWebsitePlatform = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platform: TablesInsert<"website_platforms">) => {
      const { data, error } = await supabase.from("website_platforms").insert(platform).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_platforms"] });
      toast.success("Platform added successfully");
    },
    onError: (error) => toast.error(`Failed to add platform: ${error.message}`),
  });
};

export const useUpdateWebsitePlatform = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...platform }: TablesUpdate<"website_platforms"> & { id: string }) => {
      const { data, error } = await supabase.from("website_platforms").update(platform).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_platforms"] });
      toast.success("Platform updated successfully");
    },
    onError: (error) => toast.error(`Failed to update platform: ${error.message}`),
  });
};

export const useDeleteWebsitePlatform = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("website_platforms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website_platforms"] });
      toast.success("Platform deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete platform: ${error.message}`),
  });
};

// Payment Provider mutations
export const useCreatePaymentProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (provider: TablesInsert<"payment_providers">) => {
      const { data, error } = await supabase.from("payment_providers").insert(provider).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_providers"] });
      toast.success("Payment provider added successfully");
    },
    onError: (error) => toast.error(`Failed to add payment provider: ${error.message}`),
  });
};

export const useUpdatePaymentProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...provider }: TablesUpdate<"payment_providers"> & { id: string }) => {
      const { data, error } = await supabase.from("payment_providers").update(provider).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_providers"] });
      toast.success("Payment provider updated successfully");
    },
    onError: (error) => toast.error(`Failed to update payment provider: ${error.message}`),
  });
};

export const useDeletePaymentProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_providers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_providers"] });
      toast.success("Payment provider deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete payment provider: ${error.message}`),
  });
};

// Merchant Account mutations
export const useCreateMerchantAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: TablesInsert<"merchant_accounts">) => {
      const { data, error } = await supabase.from("merchant_accounts").insert(account).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant_accounts"] });
      toast.success("Merchant account added successfully");
    },
    onError: (error) => toast.error(`Failed to add merchant account: ${error.message}`),
  });
};

export const useUpdateMerchantAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...account }: TablesUpdate<"merchant_accounts"> & { id: string }) => {
      const { data, error } = await supabase.from("merchant_accounts").update(account).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant_accounts"] });
      toast.success("Merchant account updated successfully");
    },
    onError: (error) => toast.error(`Failed to update merchant account: ${error.message}`),
  });
};

export const useDeleteMerchantAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("merchant_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant_accounts"] });
      toast.success("Merchant account deleted successfully");
    },
    onError: (error) => toast.error(`Failed to delete merchant account: ${error.message}`),
  });
};
