import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for structured data extraction
const tools = [
  {
    type: "function",
    function: {
      name: "add_entity",
      description: "Add a new business entity (company, LLC, corporation, etc.)",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Company/entity name" },
          type: { type: "string", enum: ["LLC", "Corporation", "Partnership", "Sole Proprietorship", "Non-Profit", "Trust", "Other"], description: "Entity type" },
          jurisdiction: { type: "string", description: "State or country of incorporation" },
          email: { type: "string", description: "Contact email" },
          phone: { type: "string", description: "Contact phone" },
          website: { type: "string", description: "Website URL" },
          ein_tax_id: { type: "string", description: "EIN or Tax ID" },
          registration_number: { type: "string", description: "State registration number" },
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
      description: "Add a new address for an entity",
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
      description: "Add a new bank account",
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
      description: "Add a phone number for an entity",
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
      description: "Add a tax ID for an entity",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          tax_id_number: { type: "string", description: "Tax ID number" },
          type: { type: "string", description: "Type of tax ID (e.g., EIN, SSN, VAT)" },
          authority: { type: "string", description: "Issuing authority (e.g., IRS, State)" },
          country: { type: "string", description: "Country" },
          is_primary: { type: "boolean", description: "Whether this is the primary tax ID" },
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
      description: "Add a regulatory filing or tax filing for an entity",
      parameters: {
        type: "object",
        properties: {
          entity_name: { type: "string", description: "Name of the entity" },
          title: { type: "string", description: "Filing title/description" },
          due_date: { type: "string", description: "Due date (YYYY-MM-DD format)" },
          jurisdiction: { type: "string", description: "Jurisdiction for the filing" },
          frequency: { type: "string", enum: ["annual", "quarterly", "monthly", "one-time"], description: "Filing frequency" },
          amount: { type: "number", description: "Filing fee amount" },
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
      description: "Add a law firm for an entity",
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
          practice_areas: { type: "array", items: { type: "string" }, description: "Practice areas (e.g., Corporate Law, IP, Litigation)" },
          fee_structure: { type: "string", description: "Fee structure (e.g., Hourly, Retainer, Contingency)" },
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
      name: "add_accountant_firm",
      description: "Add an accounting firm for an entity",
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
          specializations: { type: "array", items: { type: "string" }, description: "Specializations (e.g., Tax, Audit, Bookkeeping)" },
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
      description: "Add a consultant for an entity",
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
      description: "Add a registered agent for an entity",
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
      name: "search_data",
      description: "Search existing data in the database",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          table: { type: "string", enum: ["entities", "addresses", "bank_accounts", "phone_numbers", "tax_ids", "entity_filings", "contracts", "law_firms", "accountant_firms", "consultants", "registration_agents"], description: "Table to search (optional, searches all if not specified)" },
        },
        required: ["query"],
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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // First, get context from the database
    const { data: entities } = await supabase.from("entities").select("id, name").limit(50);
    const entityList = entities?.map(e => e.name).join(", ") || "None";

    const systemPrompt = `You are a helpful AI assistant for a business entity management portal. You help users quickly add and manage data.

EXISTING ENTITIES in the database: ${entityList}

IMPORTANT DISTINCTIONS:
- ENTITIES are the main business companies (LLCs, Corporations, etc.) that the user manages
- LAW FIRMS, ACCOUNTANT FIRMS, CONSULTANTS, REGISTRATION AGENTS are SERVICE PROVIDERS that work FOR the entities
- When a user mentions a law firm, accounting firm, CPA, attorney, lawyer, registered agent, or consultant - these should be added as service providers linked to an entity, NOT as new entities

When users paste information:
1. Determine if it's an entity (business the user owns/manages) or a service provider (external firm helping the entity)
2. For service providers, use add_law_firm, add_accountant_firm, add_consultant, or add_registration_agent
3. Service providers must be linked to an existing entity - ask which entity if unclear
4. If an entity doesn't exist yet, create it first before adding its service providers

Be conversational and helpful. If information is ambiguous, ask for clarification.
Format dates as YYYY-MM-DD. For phone numbers, extract country codes if present.`;

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

        try {
          switch (toolCall.function.name) {
            case "add_entity": {
              const { data, error } = await supabase.from("entities").insert({
                name: args.name,
                type: args.type || "LLC",
                jurisdiction: args.jurisdiction || null,
                email: args.email || null,
                phone: args.phone || null,
                website: args.website || null,
                ein_tax_id: args.ein_tax_id || null,
                registration_number: args.registration_number || null,
                status: "Active",
              }).select().single();
              
              if (error) throw error;
              result = { success: true, message: `Created entity "${args.name}"`, data };
              break;
            }

            case "add_address": {
              // Find entity by name
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found. Please create it first.` };
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
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

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
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added bank account "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_phone_number": {
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

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
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

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
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added tax ID for "${args.entity_name}"`, data };
              break;
            }

            case "add_filing": {
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

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
                status: "pending",
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added filing "${args.title}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_law_firm": {
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found. Please create it first.` };
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
                is_active: true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added law firm "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_accountant_firm": {
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found. Please create it first.` };
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
                is_active: true,
              }).select().single();

              if (error) throw error;
              result = { success: true, message: `Added accountant firm "${args.name}" for "${args.entity_name}"`, data };
              break;
            }

            case "add_consultant": {
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found. Please create it first.` };
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
              const { data: entity } = await supabase
                .from("entities")
                .select("id")
                .ilike("name", `%${args.entity_name}%`)
                .limit(1)
                .single();

              if (!entity) {
                result = { success: false, message: `Entity "${args.entity_name}" not found. Please create it first.` };
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

              if (!args.table || args.table === "law_firms") {
                const { data } = await supabase.from("law_firms").select("name, contact_name, email, phone").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.law_firms = data;
              }

              if (!args.table || args.table === "accountant_firms") {
                const { data } = await supabase.from("accountant_firms").select("name, contact_name, email, phone").ilike("name", `%${query}%`).limit(5);
                if (data?.length) searchResults.accountant_firms = data;
              }

              result = { success: true, message: "Search complete", data: searchResults };
              break;
            }
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
      content: choice.message?.content || "I'm here to help! Paste company information, addresses, or other data and I'll add it to your portal.",
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
