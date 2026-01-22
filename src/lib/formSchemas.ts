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
  balance: z.coerce.number().min(0, "Balance must be positive"),
});

export const creditCardSchema = z.object({
  name: z.string().trim().min(1, "Card name is required").max(100),
  card_number: z.string().trim().min(1, "Card number is required").max(30),
  cardholder_name: z.string().trim().max(100).optional().or(z.literal("")),
  expiry_date: z.string().trim().max(10).optional().or(z.literal("")),
  credit_limit: z.coerce.number().min(0, "Credit limit must be positive"),
  current_balance: z.coerce.number().min(0, "Balance must be positive"),
  minimum_payment: z.coerce.number().min(0).optional(),
  due_date: z.string().optional().or(z.literal("")),
  card_color: z.string().default("from-zinc-800 to-zinc-600"),
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
});

export const contractSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  type: z.string().min(1, "Type is required"),
  parties: z.array(z.string()).default([]),
  status: z.string().min(1, "Status is required"),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  value: z.string().trim().max(50).optional().or(z.literal("")),
  value_numeric: z.coerce.number().min(0).optional(),
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
  balance: number;
};

export type CreditCardFormData = {
  name: string;
  card_number: string;
  cardholder_name?: string;
  expiry_date?: string;
  credit_limit: number;
  current_balance: number;
  minimum_payment?: number;
  due_date?: string;
  card_color: string;
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
};

export type ContractFormData = {
  title: string;
  type: string;
  parties: string[];
  status: string;
  start_date?: string;
  end_date?: string;
  value?: string;
  value_numeric?: number;
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
