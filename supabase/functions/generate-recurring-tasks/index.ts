import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Filing {
  id: string;
  entity_id: string;
  title: string;
  due_date: string;
  status: string;
  frequency: string;
  reminder_days: number;
  filing_type_id: string | null;
}

interface FilingType {
  id: string;
  name: string;
}

interface Entity {
  id: string;
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all pending recurring filings
    const { data: filings, error: filingsError } = await supabase
      .from("entity_filings")
      .select("*")
      .eq("status", "pending")
      .neq("frequency", "one-time")
      .not("due_date", "is", null);

    if (filingsError) {
      throw new Error(`Failed to fetch filings: ${filingsError.message}`);
    }

    if (!filings || filings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recurring filings found", tasksCreated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get filing types for names
    const filingTypeIds = [...new Set(filings.map(f => f.filing_type_id).filter(Boolean))];
    let filingTypes: FilingType[] = [];
    if (filingTypeIds.length > 0) {
      const { data: types } = await supabase
        .from("filing_types")
        .select("id, name")
        .in("id", filingTypeIds);
      filingTypes = types || [];
    }

    // Get entity names
    const entityIds = [...new Set(filings.map(f => f.entity_id))];
    const { data: entities } = await supabase
      .from("entities")
      .select("id, name")
      .in("id", entityIds);
    const entityMap = new Map((entities || []).map(e => [e.id, e.name]));
    const filingTypeMap = new Map(filingTypes.map(t => [t.id, t.name]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let tasksCreated = 0;
    const errors: string[] = [];

    for (const filing of filings as Filing[]) {
      try {
        const dueDate = new Date(filing.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Skip if not within reminder period or already past
        if (daysUntilDue > filing.reminder_days || daysUntilDue < 0) {
          continue;
        }

        // Check if task already exists for this filing
        const { data: existingTask } = await supabase
          .from("filing_tasks")
          .select("id")
          .eq("filing_id", filing.id)
          .eq("is_auto_generated", true)
          .neq("status", "completed")
          .limit(1)
          .single();

        if (existingTask) {
          continue; // Task already exists
        }

        // Determine priority based on days remaining
        let priority = "low";
        if (daysUntilDue <= 7) {
          priority = "urgent";
        } else if (daysUntilDue <= 14) {
          priority = "high";
        } else if (daysUntilDue <= 30) {
          priority = "medium";
        }

        const entityName = entityMap.get(filing.entity_id) || "Entity";
        const filingTypeName = filing.filing_type_id 
          ? filingTypeMap.get(filing.filing_type_id) || "Filing"
          : "Filing";

        // Create the task
        const { error: insertError } = await supabase
          .from("filing_tasks")
          .insert({
            entity_id: filing.entity_id,
            filing_id: filing.id,
            title: `${filingTypeName} due for ${entityName}`,
            description: `Auto-generated reminder for: ${filing.title}`,
            due_date: filing.due_date,
            priority,
            status: "pending",
            is_auto_generated: true,
          });

        if (insertError) {
          errors.push(`Failed to create task for filing ${filing.id}: ${insertError.message}`);
        } else {
          tasksCreated++;
        }
      } catch (err) {
        errors.push(`Error processing filing ${filing.id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${filings.length} filings`, 
        tasksCreated,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-recurring-tasks:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
