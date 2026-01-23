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
  due_day: number | null;
  status: string;
  frequency: string;
  reminder_days: number;
  filing_type_id: string | null;
}

interface Entity {
  id: string;
  name: string;
  fiscal_year_end: string | null;
}

interface FilingType {
  id: string;
  name: string;
}

// Calculate all due dates for a fiscal year based on frequency
function calculateFiscalYearDueDates(
  fiscalYearEnd: string,
  frequency: string,
  dueDay: number,
  currentYear: number
): Date[] {
  const dueDates: Date[] = [];
  
  // Parse fiscal year end (MM-DD format)
  const [fyMonth, fyDay] = fiscalYearEnd.split("-").map(Number);
  
  // Calculate fiscal year start and end dates
  const fyEndDate = new Date(currentYear, fyMonth - 1, fyDay);
  const fyStartDate = new Date(currentYear - 1, fyMonth - 1, fyDay + 1);
  
  // If we're past the fiscal year end, move to next fiscal year
  const today = new Date();
  if (today > fyEndDate) {
    fyStartDate.setFullYear(fyStartDate.getFullYear() + 1);
    fyEndDate.setFullYear(fyEndDate.getFullYear() + 1);
  }
  
  switch (frequency) {
    case "monthly": {
      // Generate 12 monthly due dates
      for (let month = 0; month < 12; month++) {
        const startMonth = fyStartDate.getMonth();
        const startYear = fyStartDate.getFullYear();
        let targetMonth = startMonth + month;
        let targetYear = startYear;
        
        if (targetMonth > 11) {
          targetMonth -= 12;
          targetYear += 1;
        }
        
        // Handle months with fewer days
        const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const actualDay = Math.min(dueDay, lastDayOfMonth);
        
        const dueDate = new Date(targetYear, targetMonth, actualDay);
        
        // Only include dates within the fiscal year
        if (dueDate >= fyStartDate && dueDate <= fyEndDate) {
          dueDates.push(dueDate);
        }
      }
      break;
    }
    
    case "quarterly": {
      // Generate 4 quarterly due dates
      for (let quarter = 0; quarter < 4; quarter++) {
        const startMonth = fyStartDate.getMonth();
        const startYear = fyStartDate.getFullYear();
        let targetMonth = startMonth + (quarter * 3);
        let targetYear = startYear;
        
        while (targetMonth > 11) {
          targetMonth -= 12;
          targetYear += 1;
        }
        
        const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const actualDay = Math.min(dueDay, lastDayOfMonth);
        
        const dueDate = new Date(targetYear, targetMonth, actualDay);
        
        if (dueDate >= fyStartDate && dueDate <= fyEndDate) {
          dueDates.push(dueDate);
        }
      }
      break;
    }
    
    case "semi-annual": {
      // Generate 2 semi-annual due dates
      for (let half = 0; half < 2; half++) {
        const startMonth = fyStartDate.getMonth();
        const startYear = fyStartDate.getFullYear();
        let targetMonth = startMonth + (half * 6);
        let targetYear = startYear;
        
        while (targetMonth > 11) {
          targetMonth -= 12;
          targetYear += 1;
        }
        
        const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const actualDay = Math.min(dueDay, lastDayOfMonth);
        
        const dueDate = new Date(targetYear, targetMonth, actualDay);
        
        if (dueDate >= fyStartDate && dueDate <= fyEndDate) {
          dueDates.push(dueDate);
        }
      }
      break;
    }
    
    case "annual": {
      // Single annual due date
      const lastDayOfMonth = new Date(fyEndDate.getFullYear(), fyEndDate.getMonth() + 1, 0).getDate();
      const actualDay = Math.min(dueDay, lastDayOfMonth);
      dueDates.push(new Date(fyEndDate.getFullYear(), fyEndDate.getMonth(), actualDay));
      break;
    }
  }
  
  return dueDates;
}

// Calculate priority based on days until due
function calculatePriority(daysUntilDue: number): string {
  if (daysUntilDue <= 7) return "urgent";
  if (daysUntilDue <= 14) return "high";
  if (daysUntilDue <= 30) return "medium";
  return "low";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all entities with their fiscal year end
    const { data: entities, error: entitiesError } = await supabase
      .from("entities")
      .select("id, name, fiscal_year_end");

    if (entitiesError) {
      throw new Error(`Failed to fetch entities: ${entitiesError.message}`);
    }

    const entityMap = new Map<string, Entity>((entities || []).map(e => [e.id, e]));

    // Get all recurring filings (not one-time)
    const { data: filings, error: filingsError } = await supabase
      .from("entity_filings")
      .select("*")
      .neq("frequency", "one-time");

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
    const filingTypeMap = new Map(filingTypes.map(t => [t.id, t.name]));

    // Get existing tasks to avoid duplicates
    const { data: existingTasks } = await supabase
      .from("filing_tasks")
      .select("filing_id, due_date, is_auto_generated")
      .eq("is_auto_generated", true)
      .neq("status", "completed");

    const existingTaskKeys = new Set(
      (existingTasks || []).map(t => `${t.filing_id}-${t.due_date}`)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    let tasksCreated = 0;
    const errors: string[] = [];

    for (const filing of filings as Filing[]) {
      try {
        const entity = entityMap.get(filing.entity_id);
        if (!entity) continue;

        const fiscalYearEnd = entity.fiscal_year_end || "12-31";
        const dueDay = filing.due_day || new Date(filing.due_date).getDate();
        
        // Calculate all due dates for the fiscal year
        const dueDates = calculateFiscalYearDueDates(
          fiscalYearEnd,
          filing.frequency,
          dueDay,
          currentYear
        );

        const entityName = entity.name;
        const filingTypeName = filing.filing_type_id 
          ? filingTypeMap.get(filing.filing_type_id) || "Filing"
          : "Filing";

        for (const dueDate of dueDates) {
          // Skip past dates
          if (dueDate < today) continue;

          const dueDateStr = dueDate.toISOString().split("T")[0];
          const taskKey = `${filing.id}-${dueDateStr}`;

          // Skip if task already exists
          if (existingTaskKeys.has(taskKey)) continue;

          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const priority = calculatePriority(daysUntilDue);

          // Format month name for task title
          const monthName = dueDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

          const { error: insertError } = await supabase
            .from("filing_tasks")
            .insert({
              entity_id: filing.entity_id,
              filing_id: filing.id,
              title: `${filingTypeName} - ${monthName} (${entityName})`,
              description: `Auto-generated task for: ${filing.title}`,
              due_date: dueDateStr,
              priority,
              status: "pending",
              is_auto_generated: true,
            });

          if (insertError) {
            errors.push(`Failed to create task for filing ${filing.id} on ${dueDateStr}: ${insertError.message}`);
          } else {
            tasksCreated++;
            existingTaskKeys.add(taskKey); // Prevent duplicates within same run
          }
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
