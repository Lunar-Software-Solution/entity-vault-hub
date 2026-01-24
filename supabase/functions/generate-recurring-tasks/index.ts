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

// Calculate next N due dates based on frequency starting from a base date
function calculateNextDueDates(
  frequency: string,
  dueDay: number,
  count: number,
  startFromDate: Date
): Date[] {
  const dueDates: Date[] = [];
  let currentDate = new Date(startFromDate);
  
  // Get the months increment based on frequency
  let monthsIncrement = 1;
  switch (frequency) {
    case "monthly":
      monthsIncrement = 1;
      break;
    case "quarterly":
      monthsIncrement = 3;
      break;
    case "semi-annual":
      monthsIncrement = 6;
      break;
    case "annual":
      monthsIncrement = 12;
      break;
    default:
      return dueDates; // one-time filings don't have recurring tasks
  }
  
  for (let i = 0; i < count; i++) {
    // Calculate target month
    let targetMonth = currentDate.getMonth() + (i * monthsIncrement);
    let targetYear = currentDate.getFullYear();
    
    while (targetMonth > 11) {
      targetMonth -= 12;
      targetYear += 1;
    }
    
    // Handle months with fewer days
    const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const actualDay = Math.min(dueDay, lastDayOfMonth);
    
    const dueDate = new Date(targetYear, targetMonth, actualDay);
    dueDates.push(dueDate);
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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Use getClaims() instead of getUser() for signing-keys compatibility
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseAuth.auth.getClaims(token);
    if (authError || !data?.claims) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { filingId, count } = await req.json();

    if (!filingId) {
      return new Response(
        JSON.stringify({ error: "filingId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const taskCount = Math.min(Math.max(1, count || 1), 24); // Limit between 1 and 24

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the specific filing
    const { data: filing, error: filingError } = await supabase
      .from("entity_filings")
      .select("*")
      .eq("id", filingId)
      .single();

    if (filingError || !filing) {
      return new Response(
        JSON.stringify({ error: "Filing not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (filing.frequency === "one-time") {
      return new Response(
        JSON.stringify({ error: "Cannot generate recurring tasks for one-time filings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get entity name
    const { data: entity } = await supabase
      .from("entities")
      .select("id, name")
      .eq("id", filing.entity_id)
      .single();

    // Get filing type name
    let filingTypeName = "Filing";
    if (filing.filing_type_id) {
      const { data: filingType } = await supabase
        .from("filing_types")
        .select("id, name")
        .eq("id", filing.filing_type_id)
        .single();
      if (filingType) filingTypeName = filingType.name;
    }

    // Get existing tasks to avoid duplicates
    const { data: existingTasks } = await supabase
      .from("filing_tasks")
      .select("due_date")
      .eq("filing_id", filingId)
      .eq("is_auto_generated", true)
      .neq("status", "completed")
      .neq("status", "cancelled");

    const existingDates = new Set(
      (existingTasks || []).map(t => t.due_date)
    );

    // Calculate due dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDay = filing.due_day || new Date(filing.due_date).getDate();
    
    // Start from next month if we're past the due day this month
    const startDate = new Date(today);
    if (today.getDate() > dueDay) {
      startDate.setMonth(startDate.getMonth() + 1);
    }
    startDate.setDate(1); // Reset to first of month for calculation

    const dueDates = calculateNextDueDates(
      filing.frequency,
      dueDay,
      taskCount,
      startDate
    );

    let tasksCreated = 0;
    const entityName = entity?.name || "Entity";

    for (const dueDate of dueDates) {
      const dueDateStr = dueDate.toISOString().split("T")[0];

      // Skip if task already exists for this date
      if (existingDates.has(dueDateStr)) continue;

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

      if (!insertError) {
        tasksCreated++;
        existingDates.add(dueDateStr); // Prevent duplicates within same run
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Created ${tasksCreated} tasks for ${filing.title}`,
        tasksCreated
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-recurring-tasks:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});