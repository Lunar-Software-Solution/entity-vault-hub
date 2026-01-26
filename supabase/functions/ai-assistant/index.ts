import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for structured data extraction - ADD tools
const addTools = [
  {
    type: "function",
    function: {
      name: "add_entity",
      description: "Add a new business entity (company, LLC, corporation, etc.) - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Company/entity name" },
          type: { type: "string", enum: ["LLC", "Corporation", "S-Corporation", "Partnership", "LP", "LLP", "Sole Proprietorship", "Non-Profit", "Trust", "PLLC", "PC", "Corporation (Canada)", "Joint Stock Company (Quebec)", "Unlimited Liability Company", "General Partnership (Canada)", "Limited Partnership (Canada)", "LLP (Canada)", "Sole Proprietorship (Canada)", "Cooperative", "Non-Profit (Canada)", "Ltd", "PLC", "LLP (UK)", "Partnership (UK)", "Sole Trader", "CIC", "Charity", "Scottish LP", "SARL", "SAS", "SASU", "SA", "SNC", "SCI", "EURL", "Auto-entrepreneur", "Association", "EOOD", "OOD", "AD", "EAD", "ET", "SD", "KD", "KDA", "Cooperative (Bulgaria)", "Other"], description: "Entity type" },
          jurisdiction: { type: "string", description: "State or country of incorporation" },
          website: { type: "string", description: "Website URL" },
          status: { type: "string", enum: ["Active", "Inactive", "Dissolved", "Pending"], description: "Entity status" },
          fiscal_year_end: { type: "string", description: "Fiscal year end date (MM-DD)" },
          founded_date: { type: "string", description: "Founded date (YYYY-MM-DD)" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_address",
      description: "Add a new address for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity this address belongs to" },
          label: { type: "string", description: "Address label (e.g., Headquarters, Mailing, Registered Agent)" },
          street: { type: "string", description: "Street address" },
          city: { type: "string", description: "City" },
          state: { type: "string", description: "State/Province" },
          zip: { type: "string", description: "ZIP/Postal code" },
          country: { type: "string", description: "Country" },
          type: { type: "string", enum: ["Business", "Mailing", "Registered Agent", "Home", "Other"], description: "Address type" },
          is_primary: { type: "boolean", description: "Whether this is the primary address" },
        },
        required: ["entity_name", "street", "city"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_bank_account",
      description: "Add a new bank account - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity this account belongs to" },
          name: { type: "string", description: "Account nickname/name" },
          bank: { type: "string", description: "Bank name" },
          account_number: { type: "string", description: "Account number (last 4 digits ok)" },
          routing_number: { type: "string", description: "Routing number" },
          type: { type: "string", enum: ["Checking", "Savings", "Money Market", "CD"], description: "Account type" },
          currency: { type: "string", description: "Currency (e.g., USD)" },
          swift_bic: { type: "string", description: "SWIFT/BIC code" },
          iban: { type: "string", description: "IBAN" },
          account_holder_name: { type: "string", description: "Account holder name" },
          is_primary: { type: "boolean", description: "Whether this is the primary account" },
        },
        required: ["entity_name", "name", "bank", "account_number"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_phone_number",
      description: "Add a phone number for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          phone_number: { type: "string", description: "Phone number" },
          label: { type: "string", description: "Label (e.g., Main, Fax, Mobile)" },
          country_code: { type: "string", description: "Country code (e.g., +1)" },
          purpose: { type: "string", description: "Purpose of this number" },
          is_primary: { type: "boolean", description: "Whether this is the primary number" },
        },
        required: ["entity_name", "phone_number"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_tax_id",
      description: "Add a tax ID for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          tax_id_number: { type: "string", description: "Tax ID number" },
          type: { type: "string", description: "Type of tax ID (e.g., EIN, SSN, VAT)" },
          authority: { type: "string", description: "Issuing authority (e.g., IRS, State)" },
          country: { type: "string", description: "Country" },
          is_primary: { type: "boolean", description: "Whether this is the primary tax ID" },
          issued_date: { type: "string", description: "Issued date (YYYY-MM-DD)" },
          expiry_date: { type: "string", description: "Expiry date (YYYY-MM-DD)" },
        },
        required: ["entity_name", "tax_id_number", "authority"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_filing",
      description: "Add a regulatory filing or tax filing for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          title: { type: "string", description: "Filing title/description" },
          due_date: { type: "string", description: "Due date (YYYY-MM-DD format)" },
          jurisdiction: { type: "string", description: "Jurisdiction for the filing" },
          frequency: { type: "string", enum: ["annual", "quarterly", "monthly", "semi-annual", "one-time"], description: "Filing frequency" },
          amount: { type: "number", description: "Filing fee amount" },
          status: { type: "string", enum: ["pending", "filed", "overdue"], description: "Filing status" },
          reminder_days: { type: "number", description: "Days before due date to send reminder" },
        },
        required: ["entity_name", "title", "due_date"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_law_firm",
      description: "Add a law firm for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity this law firm works for" },
          name: { type: "string", description: "Law firm name" },
          contact_name: { type: "string", description: "Primary contact name" },
          email: { type: "string", description: "Contact email" },
          phone: { type: "string", description: "Phone number" },
          address: { type: "string", description: "Office address" },
          website: { type: "string", description: "Website URL" },
          bar_number: { type: "string", description: "Bar number" },
          practice_areas: { type: "array", items: { type: "string" }, description: "Practice areas" },
          fee_structure: { type: "string", description: "Fee structure" },
          linkedin_url: { type: "string", description: "LinkedIn URL" },
          notes: { type: "string", description: "Additional notes" },
          engagement_start_date: { type: "string", description: "Engagement start date (YYYY-MM-DD)" },
          engagement_end_date: { type: "string", description: "Engagement end date (YYYY-MM-DD)" },
        },
        required: ["entity_name", "name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_accountant_firm",
      description: "Add an accounting firm for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity this accountant works for" },
          name: { type: "string", description: "Accounting firm name" },
          contact_name: { type: "string", description: "Primary contact name" },
          email: { type: "string", description: "Contact email" },
          phone: { type: "string", description: "Phone number" },
          address: { type: "string", description: "Office address" },
          website: { type: "string", description: "Website URL" },
          license_number: { type: "string", description: "CPA license number" },
          specializations: { type: "array", items: { type: "string" }, description: "Specializations" },
          fee_structure: { type: "string", description: "Fee structure" },
          notes: { type: "string", description: "Additional notes" },
          engagement_start_date: { type: "string", description: "Engagement start date (YYYY-MM-DD)" },
          engagement_end_date: { type: "string", description: "Engagement end date (YYYY-MM-DD)" },
        },
        required: ["entity_name", "name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_auditor",
      description: "Add an auditor for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          name: { type: "string", description: "Auditor or audit firm name" },
          contact_name: { type: "string", description: "Primary contact name" },
          email: { type: "string", description: "Contact email" },
          phone: { type: "string", description: "Phone number" },
          address: { type: "string", description: "Office address" },
          website: { type: "string", description: "Website URL" },
          license_number: { type: "string", description: "License number" },
          audit_types: { type: "array", items: { type: "string" }, description: "Audit types (e.g., Financial, SOC2, Tax)" },
          certifications: { type: "array", items: { type: "string" }, description: "Certifications (e.g., CPA, CIA)" },
          fee_structure: { type: "string", description: "Fee structure" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["entity_name", "name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_advisor",
      description: "Add a financial or business advisor for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          name: { type: "string", description: "Advisor or advisory firm name" },
          advisor_type: { type: "string", description: "Type (e.g., Financial, Investment, M&A, Tax)" },
          contact_name: { type: "string", description: "Primary contact name" },
          email: { type: "string", description: "Contact email" },
          phone: { type: "string", description: "Phone number" },
          address: { type: "string", description: "Office address" },
          website: { type: "string", description: "Website URL" },
          certifications: { type: "array", items: { type: "string" }, description: "Certifications (e.g., CFP, CFA)" },
          fee_structure: { type: "string", description: "Fee structure" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["entity_name", "name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_consultant",
      description: "Add a consultant for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          name: { type: "string", description: "Consultant or firm name" },
          consultant_type: { type: "string", description: "Type (e.g., Management, IT, Strategy, HR)" },
          contact_name: { type: "string", description: "Primary contact name" },
          email: { type: "string", description: "Contact email" },
          phone: { type: "string", description: "Phone number" },
          address: { type: "string", description: "Address" },
          website: { type: "string", description: "Website URL" },
          project_scope: { type: "string", description: "Scope of work" },
          fee_structure: { type: "string", description: "Fee structure" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["entity_name", "name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_registration_agent",
      description: "Add a registered agent for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          name: { type: "string", description: "Registered agent name" },
          agent_type: { type: "string", description: "Type (e.g., Commercial, Individual)" },
          contact_name: { type: "string", description: "Contact name" },
          email: { type: "string", description: "Contact email" },
          phone: { type: "string", description: "Phone number" },
          address: { type: "string", description: "Registered address" },
          website: { type: "string", description: "Website URL" },
          jurisdictions_covered: { type: "array", items: { type: "string" }, description: "Jurisdictions covered" },
          fee_structure: { type: "string", description: "Fee structure" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["entity_name", "name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_credit_card",
      description: "Add a credit card for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          name: { type: "string", description: "Card name/nickname (e.g., Company Amex, Travel Card)" },
          card_number: { type: "string", description: "Last 4 digits of card number" },
          cardholder_name: { type: "string", description: "Cardholder name" },
          expiry_date: { type: "string", description: "Expiry date (MM/YY)" },
          credit_limit: { type: "number", description: "Credit limit" },
          due_date: { type: "string", description: "Payment due date (day of month)" },
          card_color: { type: "string", description: "Card color for display" },
        },
        required: ["entity_name", "name", "card_number"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_contract",
      description: "Add a contract for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          title: { type: "string", description: "Contract title" },
          type: { type: "string", description: "Contract type (e.g., Service Agreement, NDA, Lease)" },
          parties: { type: "array", items: { type: "string" }, description: "Parties involved" },
          start_date: { type: "string", description: "Start date (YYYY-MM-DD)" },
          end_date: { type: "string", description: "End date (YYYY-MM-DD)" },
          status: { type: "string", enum: ["active", "expired", "pending", "terminated"], description: "Contract status" },
        },
        required: ["entity_name", "title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_social_media",
      description: "Add a social media account for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          platform: { type: "string", description: "Platform name (e.g., LinkedIn, Twitter, Facebook, Instagram)" },
          username: { type: "string", description: "Username/handle" },
          profile_url: { type: "string", description: "Full profile URL" },
          is_verified: { type: "boolean", description: "Whether the account is verified" },
        },
        required: ["entity_name", "platform", "username"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_website",
      description: "Add a website for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          name: { type: "string", description: "Website name/label" },
          url: { type: "string", description: "Website URL" },
          type: { type: "string", description: "Type (e.g., Corporate, E-commerce, Blog, Landing Page)" },
          platform: { type: "string", description: "Platform (e.g., WordPress, Shopify, Custom)" },
          domain_expiry_date: { type: "string", description: "Domain expiry date (YYYY-MM-DD)" },
          ssl_expiry_date: { type: "string", description: "SSL certificate expiry date (YYYY-MM-DD)" },
          is_primary: { type: "boolean", description: "Whether this is the primary website" },
          is_active: { type: "boolean", description: "Whether the website is active" },
        },
        required: ["entity_name", "name", "url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_document",
      description: "Add an entity document record (without file upload) - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          title: { type: "string", description: "Document title" },
          reference_number: { type: "string", description: "Reference/document number" },
          issuing_authority: { type: "string", description: "Issuing authority" },
          issued_date: { type: "string", description: "Issue date (YYYY-MM-DD)" },
          expiry_date: { type: "string", description: "Expiry date (YYYY-MM-DD)" },
          status: { type: "string", enum: ["active", "expired", "pending", "archived"], description: "Document status" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["entity_name", "title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_director_ubo",
      description: "Add a director or UBO (Ultimate Beneficial Owner) for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          name: { type: "string", description: "Full name of director/UBO" },
          role_type: { type: "string", enum: ["Director", "UBO", "Both"], description: "Role type" },
          title: { type: "string", description: "Job title (e.g., CEO, CFO, Board Member)" },
          email: { type: "string", description: "Email address" },
          phone: { type: "string", description: "Phone number" },
          address: { type: "string", description: "Address" },
          nationality: { type: "string", description: "Nationality" },
          country_of_residence: { type: "string", description: "Country of residence" },
          date_of_birth: { type: "string", description: "Date of birth (YYYY-MM-DD)" },
          ownership_percentage: { type: "number", description: "Ownership percentage (for UBOs)" },
          appointment_date: { type: "string", description: "Appointment date (YYYY-MM-DD)" },
          resignation_date: { type: "string", description: "Resignation date (YYYY-MM-DD)" },
          is_active: { type: "boolean", description: "Whether currently active" },
          is_pep: { type: "boolean", description: "Whether a Politically Exposed Person" },
          linkedin_url: { type: "string", description: "LinkedIn URL" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["entity_name", "name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_software",
      description: "Add software/tool used by an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          custom_name: { type: "string", description: "Software name or custom name" },
          category: { type: "string", description: "Category (e.g., Accounting, CRM, HR, Communication)" },
          account_email: { type: "string", description: "Account email" },
          login_url: { type: "string", description: "Login URL" },
          license_type: { type: "string", description: "License type (e.g., Free, Monthly, Annual, Enterprise)" },
          license_expiry_date: { type: "string", description: "License expiry date (YYYY-MM-DD)" },
          is_active: { type: "boolean", description: "Whether actively used" },
          notes: { type: "string", description: "Additional notes" },
        },
        required: ["entity_name", "custom_name", "category"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_email",
      description: "Add an email address for an entity - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          email: { type: "string", description: "Email address" },
          label: { type: "string", description: "Label (e.g., Main, Support, Sales, HR)" },
          purpose: { type: "string", description: "Purpose of this email" },
          is_primary: { type: "boolean", description: "Whether this is the primary email" },
        },
        required: ["entity_name", "email"],
        additionalProperties: false,
      },
    },
  },
];

// UPDATE tools
const updateTools = [
  {
    type: "function",
    function: {
      name: "update_entity",
      description: "Update an existing entity - ONLY use after user confirms the changes",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Current name of the entity to update" },
          new_name: { type: "string", description: "New name (if changing)" },
          type: { type: "string", enum: ["LLC", "Corporation", "S-Corporation", "Partnership", "LP", "LLP", "Sole Proprietorship", "Non-Profit", "Trust", "PLLC", "PC", "Corporation (Canada)", "Joint Stock Company (Quebec)", "Unlimited Liability Company", "General Partnership (Canada)", "Limited Partnership (Canada)", "LLP (Canada)", "Sole Proprietorship (Canada)", "Cooperative", "Non-Profit (Canada)", "Ltd", "PLC", "LLP (UK)", "Partnership (UK)", "Sole Trader", "CIC", "Charity", "Scottish LP", "SARL", "SAS", "SASU", "SA", "SNC", "SCI", "EURL", "Auto-entrepreneur", "Association", "EOOD", "OOD", "AD", "EAD", "ET", "SD", "KD", "KDA", "Cooperative (Bulgaria)", "Other"] },
          jurisdiction: { type: "string" },
          website: { type: "string" },
          status: { type: "string", enum: ["Active", "Inactive", "Dissolved", "Pending"] },
          fiscal_year_end: { type: "string" },
          founded_date: { type: "string" },
        },
        required: ["entity_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_address",
      description: "Update an existing address - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_label: { type: "string", description: "Current label of the address to update" },
          label: { type: "string" },
          street: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          zip: { type: "string" },
          country: { type: "string" },
          type: { type: "string", enum: ["Business", "Mailing", "Registered Agent", "Home", "Other"] },
          is_primary: { type: "boolean" },
        },
        required: ["entity_name", "current_label"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_bank_account",
      description: "Update an existing bank account - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_name: { type: "string", description: "Current account name to update" },
          name: { type: "string" },
          bank: { type: "string" },
          account_number: { type: "string" },
          routing_number: { type: "string" },
          type: { type: "string", enum: ["Checking", "Savings", "Money Market", "CD"] },
          currency: { type: "string" },
          swift_bic: { type: "string" },
          iban: { type: "string" },
          is_primary: { type: "boolean" },
        },
        required: ["entity_name", "current_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_phone_number",
      description: "Update an existing phone number - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_phone: { type: "string", description: "Current phone number to update" },
          phone_number: { type: "string" },
          label: { type: "string" },
          country_code: { type: "string" },
          purpose: { type: "string" },
          is_primary: { type: "boolean" },
        },
        required: ["entity_name", "current_phone"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_tax_id",
      description: "Update an existing tax ID - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_tax_id: { type: "string", description: "Current tax ID number to update" },
          tax_id_number: { type: "string" },
          type: { type: "string" },
          authority: { type: "string" },
          country: { type: "string" },
          is_primary: { type: "boolean" },
          issued_date: { type: "string" },
          expiry_date: { type: "string" },
        },
        required: ["entity_name", "current_tax_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_filing",
      description: "Update an existing filing - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_title: { type: "string", description: "Current filing title to update" },
          title: { type: "string" },
          due_date: { type: "string" },
          filing_date: { type: "string" },
          jurisdiction: { type: "string" },
          frequency: { type: "string", enum: ["annual", "quarterly", "monthly", "semi-annual", "one-time"] },
          amount: { type: "number" },
          status: { type: "string", enum: ["pending", "filed", "overdue"] },
          confirmation_number: { type: "string" },
          filed_by: { type: "string" },
          notes: { type: "string" },
        },
        required: ["entity_name", "current_title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_law_firm",
      description: "Update an existing law firm - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_firm_name: { type: "string", description: "Current law firm name to update" },
          name: { type: "string" },
          contact_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          website: { type: "string" },
          bar_number: { type: "string" },
          practice_areas: { type: "array", items: { type: "string" } },
          fee_structure: { type: "string" },
          is_active: { type: "boolean" },
          notes: { type: "string" },
        },
        required: ["entity_name", "current_firm_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_accountant_firm",
      description: "Update an existing accountant firm - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_firm_name: { type: "string", description: "Current firm name to update" },
          name: { type: "string" },
          contact_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          website: { type: "string" },
          license_number: { type: "string" },
          specializations: { type: "array", items: { type: "string" } },
          fee_structure: { type: "string" },
          is_active: { type: "boolean" },
          notes: { type: "string" },
        },
        required: ["entity_name", "current_firm_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_auditor",
      description: "Update an existing auditor - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_name: { type: "string", description: "Current auditor name to update" },
          name: { type: "string" },
          contact_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          website: { type: "string" },
          license_number: { type: "string" },
          audit_types: { type: "array", items: { type: "string" } },
          certifications: { type: "array", items: { type: "string" } },
          is_active: { type: "boolean" },
        },
        required: ["entity_name", "current_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_advisor",
      description: "Update an existing advisor - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_name: { type: "string", description: "Current advisor name to update" },
          name: { type: "string" },
          advisor_type: { type: "string" },
          contact_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          website: { type: "string" },
          certifications: { type: "array", items: { type: "string" } },
          is_active: { type: "boolean" },
        },
        required: ["entity_name", "current_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_consultant",
      description: "Update an existing consultant - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_name: { type: "string", description: "Current consultant name to update" },
          name: { type: "string" },
          consultant_type: { type: "string" },
          contact_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          website: { type: "string" },
          project_scope: { type: "string" },
          is_active: { type: "boolean" },
        },
        required: ["entity_name", "current_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_registration_agent",
      description: "Update an existing registration agent - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_name: { type: "string", description: "Current agent name to update" },
          name: { type: "string" },
          agent_type: { type: "string" },
          contact_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          website: { type: "string" },
          jurisdictions_covered: { type: "array", items: { type: "string" } },
          is_active: { type: "boolean" },
        },
        required: ["entity_name", "current_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_credit_card",
      description: "Update an existing credit card - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_name: { type: "string", description: "Current card name to update" },
          name: { type: "string" },
          card_number: { type: "string" },
          cardholder_name: { type: "string" },
          expiry_date: { type: "string" },
          credit_limit: { type: "number" },
          due_date: { type: "string" },
        },
        required: ["entity_name", "current_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_contract",
      description: "Update an existing contract - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_title: { type: "string", description: "Current contract title to update" },
          title: { type: "string" },
          type: { type: "string" },
          parties: { type: "array", items: { type: "string" } },
          start_date: { type: "string" },
          end_date: { type: "string" },
          status: { type: "string", enum: ["active", "expired", "pending", "terminated"] },
        },
        required: ["entity_name", "current_title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_social_media",
      description: "Update an existing social media account - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_platform: { type: "string", description: "Current platform to update" },
          current_username: { type: "string", description: "Current username" },
          platform: { type: "string" },
          username: { type: "string" },
          profile_url: { type: "string" },
          is_verified: { type: "boolean" },
        },
        required: ["entity_name", "current_platform", "current_username"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_website",
      description: "Update an existing website - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_url: { type: "string", description: "Current website URL to update" },
          name: { type: "string" },
          url: { type: "string" },
          type: { type: "string" },
          platform: { type: "string" },
          domain_expiry_date: { type: "string" },
          ssl_expiry_date: { type: "string" },
          is_primary: { type: "boolean" },
          is_active: { type: "boolean" },
        },
        required: ["entity_name", "current_url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_document",
      description: "Update an existing document - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_title: { type: "string", description: "Current document title to update" },
          title: { type: "string" },
          reference_number: { type: "string" },
          issuing_authority: { type: "string" },
          issued_date: { type: "string" },
          expiry_date: { type: "string" },
          status: { type: "string", enum: ["active", "expired", "pending", "archived"] },
          notes: { type: "string" },
        },
        required: ["entity_name", "current_title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_director_ubo",
      description: "Update an existing director or UBO - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_name: { type: "string", description: "Current person name to update" },
          name: { type: "string" },
          role_type: { type: "string", enum: ["Director", "UBO", "Both"] },
          title: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          nationality: { type: "string" },
          country_of_residence: { type: "string" },
          ownership_percentage: { type: "number" },
          appointment_date: { type: "string" },
          resignation_date: { type: "string" },
          is_active: { type: "boolean" },
          is_pep: { type: "boolean" },
        },
        required: ["entity_name", "current_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_software",
      description: "Update an existing software record - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_name: { type: "string", description: "Current software name to update" },
          custom_name: { type: "string" },
          category: { type: "string" },
          account_email: { type: "string" },
          login_url: { type: "string" },
          license_type: { type: "string" },
          license_expiry_date: { type: "string" },
          is_active: { type: "boolean" },
          notes: { type: "string" },
        },
        required: ["entity_name", "current_name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_email",
      description: "Update an existing email address - ONLY use after user confirms",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name" },
          current_email: { type: "string", description: "Current email to update" },
          email: { type: "string" },
          label: { type: "string" },
          purpose: { type: "string" },
          is_primary: { type: "boolean" },
        },
        required: ["entity_name", "current_email"],
        additionalProperties: false,
      },
    },
  },
];

// Search tool (available to all users)
const searchTool = {
  type: "function",
  function: {
    name: "search_data",
    description: "Search existing data in the database - can use anytime",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        table: { type: "string", enum: ["entities", "addresses", "bank_accounts", "phone_numbers", "tax_ids", "entity_filings", "contracts", "law_firms", "accountant_firms", "consultants", "registration_agents", "auditors", "advisors", "credit_cards", "social_media_accounts", "entity_websites", "entity_documents", "directors_ubos", "entity_software", "entity_emails"], description: "Table to search (optional - searches all if not specified)" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
};

// Delete tool
const deleteTools = [
  {
    type: "function",
    function: {
      name: "delete_record",
      description: "Delete a record from the database - ONLY use after user explicitly confirms deletion",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Entity name (for entity-linked records)" },
          table: { type: "string", enum: ["entities", "addresses", "bank_accounts", "phone_numbers", "tax_ids", "entity_filings", "contracts", "law_firms", "accountant_firms", "consultants", "registration_agents", "auditors", "advisors", "credit_cards", "social_media_accounts", "entity_websites", "entity_documents", "directors_ubos", "entity_software", "entity_emails"], description: "Table to delete from" },
          identifier: { type: "string", description: "Unique identifier (name, title, phone number, email, etc.)" },
        },
        required: ["table", "identifier"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    // Create client with user's token to verify authentication
    const supabaseAuth = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for data operations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check user role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = roleData?.role === "admin";
    const isViewer = !isAdmin; // viewers can only search

    const { messages } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get context from the database
    const { data: entities } = await supabase.from("entities").select("id, name").limit(50);
    const entityList = entities?.map(e => e.name).join(", ") || "None";

    // Build system prompt based on role
    const roleInfo = isViewer 
      ? `\n\nIMPORTANT: The current user has VIEWER role (read-only access). You can ONLY search and answer questions. Do NOT attempt to add, update, or delete any data. If the user asks to modify data, politely explain that they need admin privileges to make changes.`
      : `\n\nThe current user has ADMIN role with full access to add, update, and delete data.`;

    const systemPrompt = `You are a helpful AI assistant for a business entity management portal. You help users quickly add, update, and manage data.

EXISTING ENTITIES in the database: ${entityList}
${roleInfo}

CRITICAL WORKFLOW - ALWAYS FOLLOW THIS:
1. When a user pastes or provides information, FIRST parse and summarize what you understood
2. Present a clear summary of what you plan to add/update and ask "Should I proceed? (Yes/No)"
3. ONLY call the add_*/update_*/delete_* tools AFTER the user confirms with "yes", "confirm", "go ahead", "do it", etc.
4. If any information is missing or unclear, ask for clarification BEFORE asking for confirmation

IMPORTANT DISTINCTIONS:
- ENTITIES are the main business companies (LLCs, Corporations, etc.) that the user manages
- SERVICE PROVIDERS (law firms, accountants, auditors, advisors, consultants, registration agents) work FOR entities
- When adding a service provider, you MUST link it to an existing entity

WHAT YOU CAN DO:
${isViewer ? "- Search and view data only (VIEWER role)" : `- Add/Update/Delete: Entities, Addresses, Bank accounts, Phone numbers, Tax IDs, Filings, Directors/UBOs
- Add/Update/Delete: Law firms, Accountant firms, Auditors, Advisors, Consultants, Registration agents
- Add/Update/Delete: Credit cards, Contracts, Social media accounts, Websites, Documents, Software, Emails
- Search all data`}

FOR UPDATES: Always confirm the current value and the new value before making changes.
FOR DELETES: Always confirm the exact record to be deleted and warn about permanence.

Format dates as YYYY-MM-DD. Always confirm before making any changes.`;

    // Select tools based on role
    const tools = isViewer 
      ? [searchTool] 
      : [...addTools, ...updateTools, ...deleteTools, searchTool];

    // Call Lovable AI with tools
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const choice = aiResult.choices?.[0];
    
    if (!choice) {
      throw new Error("No response from AI");
    }

    // Check if AI wants to call tools
    if (choice.message?.tool_calls?.length > 0) {
      const toolResults: any[] = [];
      
      for (const toolCall of choice.message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        let result: any = { success: false, message: "Unknown tool" };

        // Double-check viewer restriction
        if (isViewer && toolCall.function.name !== "search_data") {
          result = { success: false, message: "Access denied. Viewer role can only search data." };
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify(result),
          });
          continue;
        }

        try {
          // Helper function to find entity
          const findEntity = async (name: string) => {
            const { data } = await supabase
              .from("entities")
              .select("id")
              .ilike("name", `%${name}%`)
              .limit(1)
              .single();
            return data;
          };

          switch (toolCall.function.name) {
            // ADD TOOLS
            case "add_entity": {
              const { data, error } = await supabase.from("entities").insert({
                name: args.name,
                type: args.type || "LLC",
                jurisdiction: args.jurisdiction || null,
                website: args.website || null,
                status: args.status || "Active",
                fiscal_year_end: args.fiscal_year_end || null,
                founded_date: args.founded_date || null,
              }).select().single();
              
              if (error) throw error;
              result = { success: true, message: `Created entity "${args.name}"`, data };
              break;
            }

            case "add_address": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("addresses").insert({
                entity_id: entity.id,
                label: args.label || "Primary",
                street: args.street,
                city: args.city,
                state: args.state || null,
                zip: args.zip || null,
                country: args.country || "United States",
                type: args.type || "Business",
                is_primary: args.is_primary ?? false,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added address for "${args.entity_name}"`, data };
              break;
            }

            case "add_bank_account": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("bank_accounts").insert({
                entity_id: entity.id,
                name: args.name,
                bank: args.bank,
                account_number: args.account_number,
                routing_number: args.routing_number || null,
                type: args.type || "Checking",
                currency: args.currency || "USD",
                swift_bic: args.swift_bic || null,
                iban: args.iban || null,
                account_holder_name: args.account_holder_name || null,
                is_primary: args.is_primary ?? false,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added bank account "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_phone_number": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("phone_numbers").insert({
                entity_id: entity.id,
                phone_number: args.phone_number,
                label: args.label || "Main",
                country_code: args.country_code || "+1",
                purpose: args.purpose || null,
                is_primary: args.is_primary ?? false,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added phone number for "${args.entity_name}"`, data };
              break;
            }

            case "add_tax_id": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("tax_ids").insert({
                entity_id: entity.id,
                tax_id_number: args.tax_id_number,
                type: args.type || "EIN",
                authority: args.authority,
                country: args.country || "United States",
                is_primary: args.is_primary ?? false,
                issued_date: args.issued_date || null,
                expiry_date: args.expiry_date || null,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added tax ID for "${args.entity_name}"`, data };
              break;
            }

            case "add_filing": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("entity_filings").insert({
                entity_id: entity.id,
                title: args.title,
                due_date: args.due_date,
                jurisdiction: args.jurisdiction || null,
                frequency: args.frequency || "annual",
                amount: args.amount || 0,
                status: args.status || "pending",
                reminder_days: args.reminder_days || 30,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added filing "${args.title}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_law_firm": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("law_firms").insert({
                entity_id: entity.id,
                name: args.name,
                contact_name: args.contact_name || null,
                email: args.email || null,
                phone: args.phone || null,
                address: args.address || null,
                website: args.website || null,
                bar_number: args.bar_number || null,
                practice_areas: args.practice_areas || null,
                fee_structure: args.fee_structure || null,
                linkedin_url: args.linkedin_url || null,
                notes: args.notes || null,
                engagement_start_date: args.engagement_start_date || null,
                engagement_end_date: args.engagement_end_date || null,
                is_active: true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added law firm "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_accountant_firm": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("accountant_firms").insert({
                entity_id: entity.id,
                name: args.name,
                contact_name: args.contact_name || null,
                email: args.email || null,
                phone: args.phone || null,
                address: args.address || null,
                website: args.website || null,
                license_number: args.license_number || null,
                specializations: args.specializations || null,
                fee_structure: args.fee_structure || null,
                notes: args.notes || null,
                engagement_start_date: args.engagement_start_date || null,
                engagement_end_date: args.engagement_end_date || null,
                is_active: true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added accountant firm "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_auditor": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("auditors").insert({
                entity_id: entity.id,
                name: args.name,
                contact_name: args.contact_name || null,
                email: args.email || null,
                phone: args.phone || null,
                address: args.address || null,
                website: args.website || null,
                license_number: args.license_number || null,
                audit_types: args.audit_types || null,
                certifications: args.certifications || null,
                fee_structure: args.fee_structure || null,
                notes: args.notes || null,
                is_active: true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added auditor "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_advisor": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("advisors").insert({
                entity_id: entity.id,
                name: args.name,
                advisor_type: args.advisor_type || null,
                contact_name: args.contact_name || null,
                email: args.email || null,
                phone: args.phone || null,
                address: args.address || null,
                website: args.website || null,
                certifications: args.certifications || null,
                fee_structure: args.fee_structure || null,
                notes: args.notes || null,
                is_active: true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added advisor "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_consultant": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("consultants").insert({
                entity_id: entity.id,
                name: args.name,
                consultant_type: args.consultant_type || null,
                contact_name: args.contact_name || null,
                email: args.email || null,
                phone: args.phone || null,
                address: args.address || null,
                website: args.website || null,
                project_scope: args.project_scope || null,
                fee_structure: args.fee_structure || null,
                notes: args.notes || null,
                is_active: true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added consultant "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_registration_agent": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("registration_agents").insert({
                entity_id: entity.id,
                name: args.name,
                agent_type: args.agent_type || null,
                contact_name: args.contact_name || null,
                email: args.email || null,
                phone: args.phone || null,
                address: args.address || null,
                website: args.website || null,
                jurisdictions_covered: args.jurisdictions_covered || null,
                fee_structure: args.fee_structure || null,
                notes: args.notes || null,
                is_active: true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added registration agent "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_credit_card": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("credit_cards").insert({
                entity_id: entity.id,
                name: args.name,
                card_number: args.card_number,
                cardholder_name: args.cardholder_name || null,
                expiry_date: args.expiry_date || null,
                credit_limit: args.credit_limit || 0,
                due_date: args.due_date || null,
                card_color: args.card_color || "#1E3A5F",
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added credit card "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_contract": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("contracts").insert({
                entity_id: entity.id,
                title: args.title,
                type: args.type || "Service Agreement",
                parties: args.parties || [],
                start_date: args.start_date || null,
                end_date: args.end_date || null,
                status: args.status || "active",
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added contract "${args.title}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_social_media": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("social_media_accounts").insert({
                entity_id: entity.id,
                platform: args.platform,
                username: args.username,
                profile_url: args.profile_url || null,
                is_verified: args.is_verified ?? false,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added ${args.platform} account @${args.username} for "${args.entity_name}"`, data };
              break;
            }

            case "add_website": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("entity_websites").insert({
                entity_id: entity.id,
                name: args.name,
                url: args.url,
                type: args.type || "Corporate",
                platform: args.platform || null,
                domain_expiry_date: args.domain_expiry_date || null,
                ssl_expiry_date: args.ssl_expiry_date || null,
                is_primary: args.is_primary ?? false,
                is_active: args.is_active ?? true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added website "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_document": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("entity_documents").insert({
                entity_id: entity.id,
                title: args.title,
                reference_number: args.reference_number || null,
                issuing_authority: args.issuing_authority || null,
                issued_date: args.issued_date || null,
                expiry_date: args.expiry_date || null,
                status: args.status || "active",
                notes: args.notes || null,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added document "${args.title}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_director_ubo": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("directors_ubos").insert({
                entity_id: entity.id,
                name: args.name,
                role_type: args.role_type || "Director",
                title: args.title || null,
                email: args.email || null,
                phone: args.phone || null,
                address: args.address || null,
                nationality: args.nationality || null,
                country_of_residence: args.country_of_residence || null,
                date_of_birth: args.date_of_birth || null,
                ownership_percentage: args.ownership_percentage || null,
                appointment_date: args.appointment_date || null,
                resignation_date: args.resignation_date || null,
                is_active: args.is_active ?? true,
                is_pep: args.is_pep ?? false,
                linkedin_url: args.linkedin_url || null,
                notes: args.notes || null,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added ${args.role_type || "Director"} "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_software": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("entity_software").insert({
                entity_id: entity.id,
                custom_name: args.custom_name,
                category: args.category,
                account_email: args.account_email || null,
                login_url: args.login_url || null,
                license_type: args.license_type || null,
                license_expiry_date: args.license_expiry_date || null,
                is_active: args.is_active ?? true,
                notes: args.notes || null,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added software "${args.custom_name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_email": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const { data, error } = await supabase.from("entity_emails").insert({
                entity_id: entity.id,
                email: args.email,
                label: args.label || "Main",
                purpose: args.purpose || null,
                is_primary: args.is_primary ?? false,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added email "${args.email}" for "${args.entity_name}"`, data };
              break;
            }

            // UPDATE TOOLS
            case "update_entity": {
              const updateData: any = {};
              if (args.new_name) updateData.name = args.new_name;
              if (args.type) updateData.type = args.type;
              if (args.jurisdiction !== undefined) updateData.jurisdiction = args.jurisdiction;
              if (args.website !== undefined) updateData.website = args.website;
              if (args.status) updateData.status = args.status;
              if (args.fiscal_year_end !== undefined) updateData.fiscal_year_end = args.fiscal_year_end;
              if (args.founded_date !== undefined) updateData.founded_date = args.founded_date;

              const { data, error } = await supabase
                .from("entities")
                .update(updateData)
                .ilike("name", `%${args.entity_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated entity "${args.entity_name}"`, data };
              break;
            }

            case "update_address": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.label) updateData.label = args.label;
              if (args.street) updateData.street = args.street;
              if (args.city) updateData.city = args.city;
              if (args.state !== undefined) updateData.state = args.state;
              if (args.zip !== undefined) updateData.zip = args.zip;
              if (args.country) updateData.country = args.country;
              if (args.type) updateData.type = args.type;
              if (args.is_primary !== undefined) updateData.is_primary = args.is_primary;

              const { data, error } = await supabase
                .from("addresses")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("label", `%${args.current_label}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated address "${args.current_label}" for "${args.entity_name}"`, data };
              break;
            }

            case "update_bank_account": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.bank) updateData.bank = args.bank;
              if (args.account_number) updateData.account_number = args.account_number;
              if (args.routing_number !== undefined) updateData.routing_number = args.routing_number;
              if (args.type) updateData.type = args.type;
              if (args.currency) updateData.currency = args.currency;
              if (args.swift_bic !== undefined) updateData.swift_bic = args.swift_bic;
              if (args.iban !== undefined) updateData.iban = args.iban;
              if (args.is_primary !== undefined) updateData.is_primary = args.is_primary;

              const { data, error } = await supabase
                .from("bank_accounts")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated bank account "${args.current_name}"`, data };
              break;
            }

            case "update_phone_number": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.phone_number) updateData.phone_number = args.phone_number;
              if (args.label) updateData.label = args.label;
              if (args.country_code) updateData.country_code = args.country_code;
              if (args.purpose !== undefined) updateData.purpose = args.purpose;
              if (args.is_primary !== undefined) updateData.is_primary = args.is_primary;

              const { data, error } = await supabase
                .from("phone_numbers")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("phone_number", `%${args.current_phone}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated phone number`, data };
              break;
            }

            case "update_tax_id": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.tax_id_number) updateData.tax_id_number = args.tax_id_number;
              if (args.type) updateData.type = args.type;
              if (args.authority) updateData.authority = args.authority;
              if (args.country) updateData.country = args.country;
              if (args.is_primary !== undefined) updateData.is_primary = args.is_primary;
              if (args.issued_date !== undefined) updateData.issued_date = args.issued_date;
              if (args.expiry_date !== undefined) updateData.expiry_date = args.expiry_date;

              const { data, error } = await supabase
                .from("tax_ids")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("tax_id_number", `%${args.current_tax_id}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated tax ID`, data };
              break;
            }

            case "update_filing": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.title) updateData.title = args.title;
              if (args.due_date) updateData.due_date = args.due_date;
              if (args.filing_date !== undefined) updateData.filing_date = args.filing_date;
              if (args.jurisdiction !== undefined) updateData.jurisdiction = args.jurisdiction;
              if (args.frequency) updateData.frequency = args.frequency;
              if (args.amount !== undefined) updateData.amount = args.amount;
              if (args.status) updateData.status = args.status;
              if (args.confirmation_number !== undefined) updateData.confirmation_number = args.confirmation_number;
              if (args.filed_by !== undefined) updateData.filed_by = args.filed_by;
              if (args.notes !== undefined) updateData.notes = args.notes;

              const { data, error } = await supabase
                .from("entity_filings")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("title", `%${args.current_title}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated filing "${args.current_title}"`, data };
              break;
            }

            case "update_law_firm": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.contact_name !== undefined) updateData.contact_name = args.contact_name;
              if (args.email !== undefined) updateData.email = args.email;
              if (args.phone !== undefined) updateData.phone = args.phone;
              if (args.address !== undefined) updateData.address = args.address;
              if (args.website !== undefined) updateData.website = args.website;
              if (args.bar_number !== undefined) updateData.bar_number = args.bar_number;
              if (args.practice_areas) updateData.practice_areas = args.practice_areas;
              if (args.fee_structure !== undefined) updateData.fee_structure = args.fee_structure;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;
              if (args.notes !== undefined) updateData.notes = args.notes;

              const { data, error } = await supabase
                .from("law_firms")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_firm_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated law firm "${args.current_firm_name}"`, data };
              break;
            }

            case "update_accountant_firm": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.contact_name !== undefined) updateData.contact_name = args.contact_name;
              if (args.email !== undefined) updateData.email = args.email;
              if (args.phone !== undefined) updateData.phone = args.phone;
              if (args.address !== undefined) updateData.address = args.address;
              if (args.website !== undefined) updateData.website = args.website;
              if (args.license_number !== undefined) updateData.license_number = args.license_number;
              if (args.specializations) updateData.specializations = args.specializations;
              if (args.fee_structure !== undefined) updateData.fee_structure = args.fee_structure;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;
              if (args.notes !== undefined) updateData.notes = args.notes;

              const { data, error } = await supabase
                .from("accountant_firms")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_firm_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated accountant firm "${args.current_firm_name}"`, data };
              break;
            }

            case "update_auditor": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.contact_name !== undefined) updateData.contact_name = args.contact_name;
              if (args.email !== undefined) updateData.email = args.email;
              if (args.phone !== undefined) updateData.phone = args.phone;
              if (args.address !== undefined) updateData.address = args.address;
              if (args.website !== undefined) updateData.website = args.website;
              if (args.license_number !== undefined) updateData.license_number = args.license_number;
              if (args.audit_types) updateData.audit_types = args.audit_types;
              if (args.certifications) updateData.certifications = args.certifications;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;

              const { data, error } = await supabase
                .from("auditors")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated auditor "${args.current_name}"`, data };
              break;
            }

            case "update_advisor": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.advisor_type !== undefined) updateData.advisor_type = args.advisor_type;
              if (args.contact_name !== undefined) updateData.contact_name = args.contact_name;
              if (args.email !== undefined) updateData.email = args.email;
              if (args.phone !== undefined) updateData.phone = args.phone;
              if (args.address !== undefined) updateData.address = args.address;
              if (args.website !== undefined) updateData.website = args.website;
              if (args.certifications) updateData.certifications = args.certifications;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;

              const { data, error } = await supabase
                .from("advisors")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated advisor "${args.current_name}"`, data };
              break;
            }

            case "update_consultant": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.consultant_type !== undefined) updateData.consultant_type = args.consultant_type;
              if (args.contact_name !== undefined) updateData.contact_name = args.contact_name;
              if (args.email !== undefined) updateData.email = args.email;
              if (args.phone !== undefined) updateData.phone = args.phone;
              if (args.address !== undefined) updateData.address = args.address;
              if (args.website !== undefined) updateData.website = args.website;
              if (args.project_scope !== undefined) updateData.project_scope = args.project_scope;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;

              const { data, error } = await supabase
                .from("consultants")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated consultant "${args.current_name}"`, data };
              break;
            }

            case "update_registration_agent": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.agent_type !== undefined) updateData.agent_type = args.agent_type;
              if (args.contact_name !== undefined) updateData.contact_name = args.contact_name;
              if (args.email !== undefined) updateData.email = args.email;
              if (args.phone !== undefined) updateData.phone = args.phone;
              if (args.address !== undefined) updateData.address = args.address;
              if (args.website !== undefined) updateData.website = args.website;
              if (args.jurisdictions_covered) updateData.jurisdictions_covered = args.jurisdictions_covered;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;

              const { data, error } = await supabase
                .from("registration_agents")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated registration agent "${args.current_name}"`, data };
              break;
            }

            case "update_credit_card": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.card_number) updateData.card_number = args.card_number;
              if (args.cardholder_name !== undefined) updateData.cardholder_name = args.cardholder_name;
              if (args.expiry_date !== undefined) updateData.expiry_date = args.expiry_date;
              if (args.credit_limit !== undefined) updateData.credit_limit = args.credit_limit;
              if (args.due_date !== undefined) updateData.due_date = args.due_date;

              const { data, error } = await supabase
                .from("credit_cards")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated credit card "${args.current_name}"`, data };
              break;
            }

            case "update_contract": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.title) updateData.title = args.title;
              if (args.type) updateData.type = args.type;
              if (args.parties) updateData.parties = args.parties;
              if (args.start_date !== undefined) updateData.start_date = args.start_date;
              if (args.end_date !== undefined) updateData.end_date = args.end_date;
              if (args.status) updateData.status = args.status;

              const { data, error } = await supabase
                .from("contracts")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("title", `%${args.current_title}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated contract "${args.current_title}"`, data };
              break;
            }

            case "update_social_media": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.platform) updateData.platform = args.platform;
              if (args.username) updateData.username = args.username;
              if (args.profile_url !== undefined) updateData.profile_url = args.profile_url;
              if (args.is_verified !== undefined) updateData.is_verified = args.is_verified;

              const { data, error } = await supabase
                .from("social_media_accounts")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("platform", `%${args.current_platform}%`)
                .ilike("username", `%${args.current_username}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated ${args.current_platform} account`, data };
              break;
            }

            case "update_website": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.url) updateData.url = args.url;
              if (args.type) updateData.type = args.type;
              if (args.platform !== undefined) updateData.platform = args.platform;
              if (args.domain_expiry_date !== undefined) updateData.domain_expiry_date = args.domain_expiry_date;
              if (args.ssl_expiry_date !== undefined) updateData.ssl_expiry_date = args.ssl_expiry_date;
              if (args.is_primary !== undefined) updateData.is_primary = args.is_primary;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;

              const { data, error } = await supabase
                .from("entity_websites")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("url", `%${args.current_url}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated website`, data };
              break;
            }

            case "update_document": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.title) updateData.title = args.title;
              if (args.reference_number !== undefined) updateData.reference_number = args.reference_number;
              if (args.issuing_authority !== undefined) updateData.issuing_authority = args.issuing_authority;
              if (args.issued_date !== undefined) updateData.issued_date = args.issued_date;
              if (args.expiry_date !== undefined) updateData.expiry_date = args.expiry_date;
              if (args.status) updateData.status = args.status;
              if (args.notes !== undefined) updateData.notes = args.notes;

              const { data, error } = await supabase
                .from("entity_documents")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("title", `%${args.current_title}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated document "${args.current_title}"`, data };
              break;
            }

            case "update_director_ubo": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.name) updateData.name = args.name;
              if (args.role_type) updateData.role_type = args.role_type;
              if (args.title !== undefined) updateData.title = args.title;
              if (args.email !== undefined) updateData.email = args.email;
              if (args.phone !== undefined) updateData.phone = args.phone;
              if (args.address !== undefined) updateData.address = args.address;
              if (args.nationality !== undefined) updateData.nationality = args.nationality;
              if (args.country_of_residence !== undefined) updateData.country_of_residence = args.country_of_residence;
              if (args.ownership_percentage !== undefined) updateData.ownership_percentage = args.ownership_percentage;
              if (args.appointment_date !== undefined) updateData.appointment_date = args.appointment_date;
              if (args.resignation_date !== undefined) updateData.resignation_date = args.resignation_date;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;
              if (args.is_pep !== undefined) updateData.is_pep = args.is_pep;

              const { data, error } = await supabase
                .from("directors_ubos")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("name", `%${args.current_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated director/UBO "${args.current_name}"`, data };
              break;
            }

            case "update_software": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.custom_name) updateData.custom_name = args.custom_name;
              if (args.category) updateData.category = args.category;
              if (args.account_email !== undefined) updateData.account_email = args.account_email;
              if (args.login_url !== undefined) updateData.login_url = args.login_url;
              if (args.license_type !== undefined) updateData.license_type = args.license_type;
              if (args.license_expiry_date !== undefined) updateData.license_expiry_date = args.license_expiry_date;
              if (args.is_active !== undefined) updateData.is_active = args.is_active;
              if (args.notes !== undefined) updateData.notes = args.notes;

              const { data, error } = await supabase
                .from("entity_software")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("custom_name", `%${args.current_name}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated software "${args.current_name}"`, data };
              break;
            }

            case "update_email": {
              const entity = await findEntity(args.entity_name);
              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                break;
              }

              const updateData: any = {};
              if (args.email) updateData.email = args.email;
              if (args.label) updateData.label = args.label;
              if (args.purpose !== undefined) updateData.purpose = args.purpose;
              if (args.is_primary !== undefined) updateData.is_primary = args.is_primary;

              const { data, error } = await supabase
                .from("entity_emails")
                .update(updateData)
                .eq("entity_id", entity.id)
                .ilike("email", `%${args.current_email}%`)
                .select()
                .single();

              if (error) throw error;
              result = { success: true, message: `Updated email`, data };
              break;
            }

            // DELETE TOOL
            case "delete_record": {
              const tableMap: Record<string, { table: string; idField: string }> = {
                entities: { table: "entities", idField: "name" },
                addresses: { table: "addresses", idField: "label" },
                bank_accounts: { table: "bank_accounts", idField: "name" },
                phone_numbers: { table: "phone_numbers", idField: "phone_number" },
                tax_ids: { table: "tax_ids", idField: "tax_id_number" },
                entity_filings: { table: "entity_filings", idField: "title" },
                contracts: { table: "contracts", idField: "title" },
                law_firms: { table: "law_firms", idField: "name" },
                accountant_firms: { table: "accountant_firms", idField: "name" },
                consultants: { table: "consultants", idField: "name" },
                registration_agents: { table: "registration_agents", idField: "name" },
                auditors: { table: "auditors", idField: "name" },
                advisors: { table: "advisors", idField: "name" },
                credit_cards: { table: "credit_cards", idField: "name" },
                social_media_accounts: { table: "social_media_accounts", idField: "username" },
                entity_websites: { table: "entity_websites", idField: "url" },
                entity_documents: { table: "entity_documents", idField: "title" },
                directors_ubos: { table: "directors_ubos", idField: "name" },
                entity_software: { table: "entity_software", idField: "custom_name" },
                entity_emails: { table: "entity_emails", idField: "email" },
              };

              const tableInfo = tableMap[args.table];
              if (!tableInfo) {
                result = { success: false, message: `Unknown table: ${args.table}` };
                break;
              }

              let query = supabase.from(tableInfo.table).delete();
              
              if (args.table === "entities") {
                query = query.ilike("name", `%${args.identifier}%`);
              } else if (args.entity_name) {
                const entity = await findEntity(args.entity_name);
                if (!entity) {
                  result = { success: false, message: `Entity "${args.entity_name}" not found.` };
                  break;
                }
                query = query.eq("entity_id", entity.id).ilike(tableInfo.idField, `%${args.identifier}%`);
              } else {
                query = query.ilike(tableInfo.idField, `%${args.identifier}%`);
              }

              const { error } = await query;
              if (error) throw error;
              result = { success: true, message: `Deleted record from ${args.table}` };
              break;
            }

            // SEARCH TOOL
            case "search_data": {
              const searchResults: any = {};
              const query = args.query.toLowerCase();

              if (!args.table || args.table === "entities") {
                const { data } = await supabase.from("entities").select("name, type, status, jurisdiction").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.entities = data;
              }

              if (!args.table || args.table === "addresses") {
                const { data } = await supabase.from("addresses").select("label, street, city, state, country").or(`street.ilike.%${query}%,city.ilike.%${query}%`).limit(5);
                if (data?.length) searchResults.addresses = data;
              }

              if (!args.table || args.table === "bank_accounts") {
                const { data } = await supabase.from("bank_accounts").select("name, bank, type, currency").or(`name.ilike.%${query}%,bank.ilike.%${query}%`).limit(5);
                if (data?.length) searchResults.bank_accounts = data;
              }

              if (!args.table || args.table === "phone_numbers") {
                const { data } = await supabase.from("phone_numbers").select("phone_number, label, purpose").ilike("phone_number", `%${query}%`).limit(5);
                if (data?.length) searchResults.phone_numbers = data;
              }

              if (!args.table || args.table === "tax_ids") {
                const { data } = await supabase.from("tax_ids").select("tax_id_number, type, authority, country").ilike("tax_id_number", `%${query}%`).limit(5);
                if (data?.length) searchResults.tax_ids = data;
              }

              if (!args.table || args.table === "entity_filings") {
                const { data } = await supabase.from("entity_filings").select("title, due_date, status, jurisdiction").ilike("title", `%${query}%`).limit(5);
                if (data?.length) searchResults.filings = data;
              }

              if (!args.table || args.table === "contracts") {
                const { data } = await supabase.from("contracts").select("title, type, status, parties").ilike("title", `%${query}%`).limit(5);
                if (data?.length) searchResults.contracts = data;
              }

              if (!args.table || args.table === "law_firms") {
                const { data } = await supabase.from("law_firms").select("name, contact_name, email, phone").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.law_firms = data;
              }

              if (!args.table || args.table === "accountant_firms") {
                const { data } = await supabase.from("accountant_firms").select("name, contact_name, email, phone").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.accountant_firms = data;
              }

              if (!args.table || args.table === "auditors") {
                const { data } = await supabase.from("auditors").select("name, contact_name, email, phone").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.auditors = data;
              }

              if (!args.table || args.table === "advisors") {
                const { data } = await supabase.from("advisors").select("name, advisor_type, contact_name, email").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.advisors = data;
              }

              if (!args.table || args.table === "consultants") {
                const { data } = await supabase.from("consultants").select("name, consultant_type, contact_name, email").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.consultants = data;
              }

              if (!args.table || args.table === "registration_agents") {
                const { data } = await supabase.from("registration_agents").select("name, agent_type, contact_name, email").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.registration_agents = data;
              }

              if (!args.table || args.table === "credit_cards") {
                const { data } = await supabase.from("credit_cards").select("name, card_number, cardholder_name, credit_limit").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.credit_cards = data;
              }

              if (!args.table || args.table === "social_media_accounts") {
                const { data } = await supabase.from("social_media_accounts").select("platform, username, profile_url, is_verified").or(`platform.ilike.%${query}%,username.ilike.%${query}%`).limit(5);
                if (data?.length) searchResults.social_media = data;
              }

              if (!args.table || args.table === "entity_websites") {
                const { data } = await supabase.from("entity_websites").select("name, url, type, is_active").or(`name.ilike.%${query}%,url.ilike.%${query}%`).limit(5);
                if (data?.length) searchResults.websites = data;
              }

              if (!args.table || args.table === "entity_documents") {
                const { data } = await supabase.from("entity_documents").select("title, status, issuing_authority, expiry_date").ilike("title", `%${query}%`).limit(5);
                if (data?.length) searchResults.documents = data;
              }

              if (!args.table || args.table === "directors_ubos") {
                const { data } = await supabase.from("directors_ubos").select("name, role_type, title, email, is_active").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.directors_ubos = data;
              }

              if (!args.table || args.table === "entity_software") {
                const { data } = await supabase.from("entity_software").select("custom_name, category, account_email, is_active").ilike("custom_name", `%${query}%`).limit(5);
                if (data?.length) searchResults.software = data;
              }

              if (!args.table || args.table === "entity_emails") {
                const { data } = await supabase.from("entity_emails").select("email, label, purpose, is_primary").ilike("email", `%${query}%`).limit(5);
                if (data?.length) searchResults.emails = data;
              }

              result = { success: true, message: "Search complete", data: searchResults };
              break;
            }

            default:
              result = { success: false, message: `Unknown tool: ${toolCall.function.name}` };
          }
        } catch (err: any) {
          console.error(`Tool ${toolCall.function.name} error:`, err);
          result = { success: false, message: err.message || "Operation failed" };
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result),
        });
      }

      // Make follow-up call with tool results
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            choice.message,
            ...toolResults,
          ],
        }),
      });

      if (!followUpResponse.ok) {
        throw new Error("Follow-up AI call failed");
      }

      const followUpResult = await followUpResponse.json();
      const finalMessage = followUpResult.choices?.[0]?.message?.content || "Done!";

      return new Response(JSON.stringify({ 
        content: finalMessage,
        toolsUsed: choice.message.tool_calls.map((t: any) => t.function.name),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tools called, return direct response
    return new Response(JSON.stringify({ 
      content: choice.message?.content || "I'm here to help! Paste company information, addresses, or other data and I'll help you add it to your portal. I'll always ask for confirmation before making any changes.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: error.message || "An error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
