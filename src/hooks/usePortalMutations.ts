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

