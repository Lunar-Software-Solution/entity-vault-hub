import { z } from "zod";

export const entitySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
  type: z.string().min(1, "Type is required"),
  status: z.string().min(1, "Status is required"),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().max(30, "Phone must be less than 30 characters").optional().or(z.literal("")),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  jurisdiction: z.string().trim().max(100).optional().or(z.literal("")),
  founded_date: z.string().optional().or(z.literal("")),
  ein_tax_id: z.string().trim().max(50).optional().or(z.literal("")),
  registration_number: z.string().trim().max(50).optional().or(z.literal("")),
  duns_number: z.string().trim().max(50).optional().or(z.literal("")),
  is_verified: z.boolean().default(false),
});

export const bankAccountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required").max(100),
  bank: z.string().trim().min(1, "Bank name is required").max(100),
  account_number: z.string().trim().min(1, "Account number is required").max(50),
  routing_number: z.string().trim().max(50).optional().or(z.literal("")),
  type: z.string().min(1, "Account type is required"),
  currency: z.string().min(1, "Currency is required"),
  entity_id: z.string().uuid().optional().or(z.literal("")),
});

export const creditCardSchema = z.object({
  name: z.string().trim().min(1, "Card name is required").max(100),
  card_number: z.string().trim().min(1, "Card number is required").max(30),
  cardholder_name: z.string().trim().max(100).optional().or(z.literal("")),
  expiry_date: z.string().trim().max(10).optional().or(z.literal("")),
  credit_limit: z.coerce.number().min(0, "Credit limit must be positive"),
  due_date: z.string().optional().or(z.literal("")),
  card_color: z.string().default("from-zinc-800 to-zinc-600"),
  entity_id: z.string().uuid().optional().or(z.literal("")),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(100),
  type: z.string().min(1, "Type is required"),
  street: z.string().trim().min(1, "Street address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  zip: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().min(1, "Country is required").max(100),
  is_primary: z.boolean().default(false),
  entity_id: z.string().uuid().optional().or(z.literal("")),
});

export const contractSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  type: z.string().min(1, "Type is required"),
  parties: z.array(z.string()).default([]),
  status: z.string().min(1, "Status is required"),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  entity_id: z.string().uuid().optional().or(z.literal("")),
});

export const socialMediaSchema = z.object({
  platform: z.string().trim().min(1, "Platform is required").max(50),
  username: z.string().trim().min(1, "Username is required").max(100),
  profile_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  followers: z.string().trim().max(20).optional().or(z.literal("")),
  is_verified: z.boolean().default(false),
  color: z.string().default("bg-zinc-800"),
  icon: z.string().max(10).optional().or(z.literal("")),
});

export const phoneNumberSchema = z.object({
  entity_id: z.string().uuid("Entity is required"),
  phone_number: z.string().trim().min(1, "Phone number is required").max(30),
  country_code: z.string().trim().min(1, "Country code is required").max(10),
  label: z.string().trim().min(1, "Label is required").max(50),
  purpose: z.string().trim().max(100).optional().or(z.literal("")),
  is_primary: z.boolean().default(false),
});

export const taxIdSchema = z.object({
  entity_id: z.string().uuid("Entity is required"),
  tax_id_number: z.string().trim().min(1, "Tax ID number is required").max(50),
  type: z.string().trim().min(1, "Type is required").max(50),
  authority: z.string().trim().min(1, "Authority is required").max(100),
  country: z.string().trim().min(1, "Country is required").max(100),
  issued_date: z.string().optional().or(z.literal("")),
  expiry_date: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  is_primary: z.boolean().default(false),
});

// Use explicit types to ensure required fields are properly typed
export type EntityFormData = {
  name: string;
  type: string;
  status: string;
  email?: string;
  phone?: string;
  website?: string;
  jurisdiction?: string;
  founded_date?: string;
  ein_tax_id?: string;
  registration_number?: string;
  duns_number?: string;
  is_verified: boolean;
};

export type BankAccountFormData = {
  name: string;
  bank: string;
  account_number: string;
  routing_number?: string;
  type: string;
  currency: string;
  entity_id?: string;
};

export type CreditCardFormData = {
  name: string;
  card_number: string;
  cardholder_name?: string;
  expiry_date?: string;
  credit_limit: number;
  due_date?: string;
  card_color: string;
  entity_id?: string;
};

export type AddressFormData = {
  label: string;
  type: string;
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  is_primary: boolean;
  entity_id?: string;
};

export type ContractFormData = {
  title: string;
  type: string;
  parties: string[];
  status: string;
  start_date?: string;
  end_date?: string;
  entity_id?: string;
};

export type SocialMediaFormData = {
  platform: string;
  username: string;
  profile_url?: string;
  followers?: string;
  is_verified: boolean;
  color: string;
  icon?: string;
};

export type PhoneNumberFormData = {
  entity_id: string;
  phone_number: string;
  country_code: string;
  label: string;
  purpose?: string;
  is_primary: boolean;
};

export type TaxIdFormData = {
  entity_id: string;
  tax_id_number: string;
  type: string;
  authority: string;
  country: string;
  issued_date?: string;
  expiry_date?: string;
  notes?: string;
  is_primary: boolean;
};
