import { z } from "zod";

// Document Type Schema
export const documentTypeSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(20, "Code must be 20 characters or less"),
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  category: z.string().trim().min(1, "Category is required"),
  description: z.string().trim().max(500, "Description must be 500 characters or less").optional().or(z.literal("")),
});

export type DocumentTypeFormData = z.infer<typeof documentTypeSchema>;

// Entity Document Schema
export const entityDocumentSchema = z.object({
  entity_id: z.string().uuid("Entity is required"),
  document_type_id: z.string().uuid("Document type is required").optional().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  file_path: z.string().optional().or(z.literal("")),
  file_name: z.string().optional().or(z.literal("")),
  issued_date: z.string().optional().or(z.literal("")),
  expiry_date: z.string().optional().or(z.literal("")),
  issuing_authority: z.string().trim().max(200, "Issuing authority must be 200 characters or less").optional().or(z.literal("")),
  reference_number: z.string().trim().max(100, "Reference number must be 100 characters or less").optional().or(z.literal("")),
  notes: z.string().trim().max(1000, "Notes must be 1000 characters or less").optional().or(z.literal("")),
  status: z.enum(["current", "superseded", "expired"]).default("current"),
});

export type EntityDocumentFormData = z.infer<typeof entityDocumentSchema>;

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
  bank_website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  account_number: z.string().trim().min(1, "Account number is required").max(50),
  routing_number: z.string().trim().max(50).optional().or(z.literal("")),
  type: z.string().min(1, "Account type is required"),
  currency: z.string().min(1, "Currency is required"),
  entity_id: z.string().uuid().optional().or(z.literal("")),
});

export const creditCardSchema = z.object({
  name: z.string().trim().min(1, "Card name is required").max(100),
  issuer_website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
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
  entity_id: z.string().uuid().optional().or(z.literal("")),
  avatar_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
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

// Base provider schema for common fields
const baseProviderSchema = z.object({
  entity_id: z.string().uuid("Entity is required"),
  name: z.string().trim().min(1, "Name is required").max(200),
  contact_name: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  engagement_start_date: z.string().optional().or(z.literal("")),
  engagement_end_date: z.string().optional().or(z.literal("")),
  fee_structure: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export const accountantFirmSchema = baseProviderSchema.extend({
  license_number: z.string().trim().max(100).optional().or(z.literal("")),
  specializations: z.array(z.string()).default([]),
});

export const lawFirmSchema = baseProviderSchema.extend({
  bar_number: z.string().trim().max(100).optional().or(z.literal("")),
  practice_areas: z.array(z.string()).default([]),
});

export const registrationAgentSchema = baseProviderSchema.extend({
  agent_type: z.string().trim().max(100).optional().or(z.literal("")),
  jurisdictions_covered: z.array(z.string()).default([]),
});

export const advisorSchema = baseProviderSchema.extend({
  advisor_type: z.string().trim().max(100).optional().or(z.literal("")),
  certifications: z.array(z.string()).default([]),
});

export const consultantSchema = baseProviderSchema.extend({
  consultant_type: z.string().trim().max(100).optional().or(z.literal("")),
  project_scope: z.string().trim().max(500).optional().or(z.literal("")),
});

export const auditorSchema = baseProviderSchema.extend({
  license_number: z.string().trim().max(100).optional().or(z.literal("")),
  audit_types: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
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
  bank_website?: string;
  account_number: string;
  routing_number?: string;
  type: string;
  currency: string;
  entity_id?: string;
};

export type CreditCardFormData = {
  name: string;
  issuer_website?: string;
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
  entity_id?: string;
  avatar_url?: string;
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

// Base type for all provider forms
export type BaseProviderFormData = {
  entity_id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin_url?: string;
  address?: string;
  engagement_start_date?: string;
  engagement_end_date?: string;
  fee_structure?: string;
  notes?: string;
  is_active: boolean;
};

export type AccountantFirmFormData = BaseProviderFormData & {
  license_number?: string;
  specializations: string[];
};

export type LawFirmFormData = BaseProviderFormData & {
  bar_number?: string;
  practice_areas: string[];
};

export type RegistrationAgentFormData = BaseProviderFormData & {
  agent_type?: string;
  jurisdictions_covered: string[];
};

export type AdvisorFormData = BaseProviderFormData & {
  advisor_type?: string;
  certifications: string[];
};

export type ConsultantFormData = BaseProviderFormData & {
  consultant_type?: string;
  project_scope?: string;
};

export type AuditorFormData = BaseProviderFormData & {
  license_number?: string;
  audit_types: string[];
  certifications: string[];
};

// Filing Type Schema
export const filingTypeSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(20, "Code must be 20 characters or less"),
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  category: z.string().trim().min(1, "Category is required"),
  description: z.string().trim().max(500, "Description must be 500 characters or less").optional().or(z.literal("")),
  default_frequency: z.string().trim().min(1, "Frequency is required"),
});

export type FilingTypeFormData = z.infer<typeof filingTypeSchema>;

// Entity Filing Schema
export const entityFilingSchema = z.object({
  entity_id: z.string().uuid("Entity is required"),
  filing_type_id: z.string().uuid("Filing type is required").optional().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  jurisdiction: z.string().trim().max(100, "Jurisdiction must be 100 characters or less").optional().or(z.literal("")),
  due_date: z.string().min(1, "Due date is required"),
  filing_date: z.string().optional().or(z.literal("")),
  frequency: z.string().trim().min(1, "Frequency is required"),
  amount: z.coerce.number().min(0, "Amount must be positive").default(0),
  confirmation_number: z.string().trim().max(100, "Confirmation number must be 100 characters or less").optional().or(z.literal("")),
  filed_by: z.string().trim().max(100, "Filed by must be 100 characters or less").optional().or(z.literal("")),
  notes: z.string().trim().max(1000, "Notes must be 1000 characters or less").optional().or(z.literal("")),
  status: z.enum(["pending", "filed", "overdue"]).default("pending"),
  reminder_days: z.coerce.number().min(1).max(365).default(30),
});

export type EntityFilingFormData = z.infer<typeof entityFilingSchema>;

// Filing Task Schema
export const filingTaskSchema = z.object({
  entity_id: z.string().uuid("Entity is required"),
  filing_id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  description: z.string().trim().max(1000, "Description must be 1000 characters or less").optional().or(z.literal("")),
  due_date: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  assigned_to: z.string().trim().max(100, "Assigned to must be 100 characters or less").optional().or(z.literal("")),
});

export type FilingTaskFormData = z.infer<typeof filingTaskSchema>;
